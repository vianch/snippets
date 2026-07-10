import { NextRequest, NextResponse } from "next/server";

import {
	aiActions,
	AiProviderId,
	AiStreamEventType,
	aiSystemPrompts,
	defaultAnthropicModel,
	defaultNvidiaModel,
	defaultOllamaUrl,
	defaultOpenAIModel,
	defaultOpenRouterModel,
	nvidiaBaseUrl,
	ollamaCloudUrl,
	openAiBaseUrl,
	openRouterAppTitle,
	openRouterBaseUrl,
	openRouterRefererUrl,
	UserRole,
} from "@/lib/constants/ai";
import { HttpStatusCode } from "@/lib/constants/ui.constants";
import { logger } from "@/lib/logger/logger";
import { connectClaude, pumpClaudeStream } from "@/lib/ai/providers/claude";
import {
	connectOllama,
	fetchOllamaContextWindow,
	pumpOllamaStream,
} from "@/lib/ai/providers/ollama";
import {
	connectOpenAiCompatible,
	pumpOpenAiCompatibleStream,
} from "@/lib/ai/providers/openAiCompatible";
import createSupabaseServerClient from "@/lib/supabase/server";
import { sanitizeHistory } from "@/utils/chat.utils";
import { stripMarkdownCodeFences } from "@/utils/string.utils";
import { isSafeRemoteUrl } from "@/utils/url.utils";

const maxCodeLength = 50_000;
const maxPromptLength = 4_000;
const defaultOllamaModel = process.env.OLLAMA_MODEL || "codellama";

export const maxDuration = 60;

const validActions: AiAction[] = [
	aiActions.explain,
	aiActions.comments,
	aiActions.format,
	aiActions.optimize,
	aiActions.refactor,
	aiActions.json,
	aiActions.ask,
	aiActions.complete,
];

const streamEncoder = new TextEncoder();

const linkAbort = (source: AbortSignal, target: AbortController): void => {
	if (source.aborted) {
		target.abort();

		return;
	}

	source.addEventListener("abort", () => target.abort(), { once: true });
};

const createStreamResponse = (
	abortController: AbortController,
	pump: (emit: AiStreamEmit) => Promise<void>
): Response => {
	const stream = new ReadableStream<Uint8Array>({
		start: async (controller) => {
			let closed = false;

			const emit: AiStreamEmit = (event) => {
				if (closed) {
					return;
				}

				try {
					controller.enqueue(
						streamEncoder.encode(`${JSON.stringify(event)}\n`)
					);
				} catch {
					closed = true;
				}
			};

			try {
				await pump(emit);
			} catch (streamError) {
				// The provider error is swallowed into a stream event below, so the
				// server-side stack would never reach Sentry otherwise. Log it here.
				logger.error(streamError, { source: "ai-stream" });

				const message =
					streamError instanceof Error
						? streamError.message
						: "AI stream failed";

				emit({ type: AiStreamEventType.Error, error: message });
			} finally {
				if (!closed) {
					try {
						controller.close();
					} catch {
						closed = true;
					}
				}
			}
		},
		cancel: () => {
			abortController.abort();
		},
	});

	return new Response(stream, {
		headers: {
			"Cache-Control": "no-cache, no-transform",
			"Content-Type": "application/x-ndjson; charset=utf-8",
		},
	});
};

const emitDone = (
	emit: AiStreamEmit,
	outcome: AiStreamOutcome,
	stripFences: boolean,
	provider: AiProvider,
	model: string,
	usage?: AiUsage
): void => {
	emit({
		type: AiStreamEventType.Done,
		result: stripFences ? stripMarkdownCodeFences(outcome.text) : outcome.text,
		thinking: outcome.thinking || undefined,
		provider,
		model,
		usage,
	});
};

const buildAskSystemPrompt = (language: string, code: string): string => {
	const base = aiSystemPrompts.ask(language || "unknown");

	return `${base}\n\nHere is the ${language || "code"} snippet:\n\`\`\`${language || ""}\n${code}\n\`\`\``;
};

export const POST = async (request: NextRequest): Promise<Response> => {
	try {
		const { supabase } = await createSupabaseServerClient(request);
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: HttpStatusCode.Unauthorized }
			);
		}

		const body = (await request.json()) as AiRequest;
		const { action, code, language, userPrompt, history } = body;

		if (!action || !validActions.includes(action)) {
			return NextResponse.json(
				{
					error:
						"Invalid action. Must be one of: explain, comments, format, optimize, json, ask",
				},
				{ status: HttpStatusCode.BadRequest }
			);
		}

		if (!code || code.trim().length === 0) {
			return NextResponse.json(
				{ error: "Code is required" },
				{ status: HttpStatusCode.BadRequest }
			);
		}

		if (code.length > maxCodeLength) {
			return NextResponse.json(
				{ error: `Code exceeds ${maxCodeLength} character limit` },
				{ status: HttpStatusCode.PayloadTooLarge }
			);
		}

		const isAskAction = action === aiActions.ask;

		if (isAskAction && (!userPrompt || userPrompt.trim().length === 0)) {
			return NextResponse.json(
				{ error: "userPrompt is required for the ask action" },
				{ status: HttpStatusCode.BadRequest }
			);
		}

		if (isAskAction && userPrompt && userPrompt.length > maxPromptLength) {
			return NextResponse.json(
				{ error: `Prompt exceeds ${maxPromptLength} character limit` },
				{ status: HttpStatusCode.PayloadTooLarge }
			);
		}

		const systemPrompt = isAskAction
			? buildAskSystemPrompt(language || "unknown", code)
			: aiSystemPrompts[action](language || "unknown");
		const prompt = isAskAction ? (userPrompt as string) : code;
		const stripFences = !isAskAction;
		const priorMessages = isAskAction ? sanitizeHistory(history) : [];
		const messages: AiHistoryMessage[] = [
			...priorMessages,
			{ role: UserRole.User, content: prompt },
		];
		const metadata = user.user_metadata ?? {};
		const aiProvider = (metadata.ai_provider as string) || AiProviderId.Ollama;
		const aiApiKey = (metadata.ai_api_key as string) || "";
		const aiModel = (metadata.ai_model as string) || "";
		const aiUrl = (metadata.ai_url as string) || "";

		const upstreamAbort = new AbortController();

		linkAbort(request.signal, upstreamAbort);

		// OpenAI provider
		if (aiProvider === AiProviderId.OpenAi) {
			const openaiApiKey = aiApiKey || process.env.OPENAI_API_KEY || "";

			if (!openaiApiKey) {
				return NextResponse.json(
					{
						error:
							"OpenAI API key not configured. Add your API key in Account Settings > AI tab.",
					},
					{ status: HttpStatusCode.ServiceUnavailable }
				);
			}

			const openaiModel = aiModel || defaultOpenAIModel;
			const upstream = await connectOpenAiCompatible(
				openAiBaseUrl,
				"OpenAI",
				messages,
				systemPrompt,
				openaiApiKey,
				openaiModel,
				upstreamAbort.signal
			);

			return createStreamResponse(upstreamAbort, async (emit) => {
				const outcome = await pumpOpenAiCompatibleStream(upstream, emit);

				emitDone(emit, outcome, stripFences, AiProviderId.OpenAi, openaiModel);
			});
		}

		// NVIDIA provider (OpenAI-compatible)
		if (aiProvider === AiProviderId.Nvidia) {
			const nvidiaApiKey = aiApiKey || process.env.NVIDIA_API_KEY || "";

			if (!nvidiaApiKey) {
				return NextResponse.json(
					{
						error:
							"NVIDIA API key not configured. Add your API key in Account Settings > AI tab.",
					},
					{ status: HttpStatusCode.ServiceUnavailable }
				);
			}

			const nvidiaModel = aiModel || defaultNvidiaModel;
			const upstream = await connectOpenAiCompatible(
				nvidiaBaseUrl,
				"NVIDIA",
				messages,
				systemPrompt,
				nvidiaApiKey,
				nvidiaModel,
				upstreamAbort.signal
			);

			return createStreamResponse(upstreamAbort, async (emit) => {
				const outcome = await pumpOpenAiCompatibleStream(upstream, emit);

				emitDone(emit, outcome, stripFences, AiProviderId.Nvidia, nvidiaModel);
			});
		}

		// OpenRouter provider (OpenAI-compatible)
		if (aiProvider === AiProviderId.OpenRouter) {
			// Env key first: ai_api_key is shared across providers, so a key saved
			// for another provider would otherwise be sent to OpenRouter.
			const openRouterApiKey = process.env.OPENROUTER_API_KEY || aiApiKey || "";

			if (!openRouterApiKey) {
				return NextResponse.json(
					{
						error:
							"OpenRouter API key not configured. Add your API key in Account Settings > AI tab.",
					},
					{ status: HttpStatusCode.ServiceUnavailable }
				);
			}

			const openRouterModel = aiModel || defaultOpenRouterModel;
			const upstream = await connectOpenAiCompatible(
				openRouterBaseUrl,
				"OpenRouter",
				messages,
				systemPrompt,
				openRouterApiKey,
				openRouterModel,
				upstreamAbort.signal,
				{
					"HTTP-Referer": openRouterRefererUrl,
					"X-Title": openRouterAppTitle,
				}
			);

			return createStreamResponse(upstreamAbort, async (emit) => {
				const outcome = await pumpOpenAiCompatibleStream(upstream, emit);

				emitDone(
					emit,
					outcome,
					stripFences,
					AiProviderId.OpenRouter,
					openRouterModel
				);
			});
		}

		// Claude provider (explicit)
		if (aiProvider === AiProviderId.Claude) {
			const claudeApiKey = aiApiKey || process.env.ANTHROPIC_API_KEY || "";

			if (!claudeApiKey) {
				return NextResponse.json(
					{
						error:
							"Claude API key not configured. Add your API key in Account Settings > AI tab.",
					},
					{ status: HttpStatusCode.ServiceUnavailable }
				);
			}

			const claudeModel = aiModel || defaultAnthropicModel;
			const upstream = await connectClaude(
				messages,
				systemPrompt,
				claudeApiKey,
				claudeModel,
				upstreamAbort.signal
			);

			return createStreamResponse(upstreamAbort, async (emit) => {
				const outcome = await pumpClaudeStream(upstream, emit);

				emitDone(emit, outcome, stripFences, AiProviderId.Claude, claudeModel);
			});
		}

		// Ollama provider (default) with Claude fallback
		const ollamaModel = aiModel || defaultOllamaModel;

		if (aiUrl && !isSafeRemoteUrl(aiUrl)) {
			return NextResponse.json(
				{ error: "Configured AI URL is not allowed" },
				{ status: HttpStatusCode.BadRequest }
			);
		}

		const ollamaUrl = aiUrl || defaultOllamaUrl;
		// Withhold the server's Ollama key from a user-supplied URL; only forward
		// a key the caller configured themselves.
		const ollamaApiKey = aiUrl
			? aiApiKey || undefined
			: aiApiKey || process.env.OLLAMA_API_KEY || undefined;
		const attempts: Array<{ provider: string; error: string }> = [];

		// 1. Try custom Ollama URL (tunnel or local)
		try {
			const upstream = await connectOllama(
				messages,
				systemPrompt,
				ollamaModel,
				ollamaUrl,
				ollamaApiKey,
				upstreamAbort.signal
			);

			return createStreamResponse(upstreamAbort, async (emit) => {
				const contextWindowPromise = fetchOllamaContextWindow(
					ollamaUrl,
					ollamaModel,
					ollamaApiKey
				);
				const outcome = await pumpOllamaStream(upstream, emit);
				const contextWindow = await contextWindowPromise;

				emitDone(emit, outcome, stripFences, AiProviderId.Ollama, ollamaModel, {
					inputTokens: outcome.inputTokens,
					outputTokens: outcome.outputTokens,
					contextWindow,
				});
			});
		} catch (ollamaError) {
			attempts.push({
				provider: AiProviderId.Ollama,
				error:
					ollamaError instanceof Error ? ollamaError.message : "Unknown error",
			});
		}

		// 2. Try Ollama Cloud directly with API key
		if (ollamaApiKey && ollamaUrl !== ollamaCloudUrl) {
			try {
				const upstream = await connectOllama(
					messages,
					systemPrompt,
					ollamaModel,
					ollamaCloudUrl,
					ollamaApiKey,
					upstreamAbort.signal
				);

				return createStreamResponse(upstreamAbort, async (emit) => {
					const contextWindowPromise = fetchOllamaContextWindow(
						ollamaCloudUrl,
						ollamaModel,
						ollamaApiKey
					);
					const outcome = await pumpOllamaStream(upstream, emit);
					const contextWindow = await contextWindowPromise;

					emitDone(
						emit,
						outcome,
						stripFences,
						AiProviderId.OllamaCloud,
						ollamaModel,
						{
							inputTokens: outcome.inputTokens,
							outputTokens: outcome.outputTokens,
							contextWindow,
						}
					);
				});
			} catch (ollamaCloudError) {
				attempts.push({
					provider: AiProviderId.OllamaCloud,
					error:
						ollamaCloudError instanceof Error
							? ollamaCloudError.message
							: "Unknown error",
				});
			}
		}

		// 3. Fallback to Claude API
		const fallbackApiKey = aiApiKey || process.env.ANTHROPIC_API_KEY || "";

		if (!fallbackApiKey) {
			return NextResponse.json(
				{
					error:
						"No AI provider configured. Set up your Ollama URL or API key in Account Settings > AI tab.",
					code: "no_provider_configured",
					attempts,
				},
				{ status: HttpStatusCode.ServiceUnavailable }
			);
		}

		try {
			const upstream = await connectClaude(
				messages,
				systemPrompt,
				fallbackApiKey,
				defaultAnthropicModel,
				upstreamAbort.signal
			);

			return createStreamResponse(upstreamAbort, async (emit) => {
				const outcome = await pumpClaudeStream(upstream, emit);

				emitDone(
					emit,
					outcome,
					stripFences,
					AiProviderId.Claude,
					defaultAnthropicModel
				);
			});
		} catch (claudeError) {
			attempts.push({
				provider: AiProviderId.Claude,
				error:
					claudeError instanceof Error ? claudeError.message : "Unknown error",
			});

			return NextResponse.json(
				{
					error: "All AI providers failed",
					code: "all_providers_failed",
					attempts,
				},
				{ status: HttpStatusCode.BadGateway }
			);
		}
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "An unexpected error occurred";

		return NextResponse.json(
			{ error: errorMessage },
			{ status: HttpStatusCode.InternalServerError }
		);
	}
};
