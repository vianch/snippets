import { NextRequest, NextResponse } from "next/server";

import {
	aiActions,
	AiStreamEventType,
	aiSystemPrompts,
	claudeAdaptivePattern,
	claudeAdaptiveSummarizedPattern,
	claudeContentBlockDeltaEvent,
	claudeExtendedThinkingPattern,
	claudeMaxOutputTokens,
	claudeTextDeltaType,
	claudeThinkingBudgetTokens,
	claudeThinkingDeltaType,
	maxOutputTokens,
	ollamaTimeout,
	sseDoneSentinel,
	ssePrefix,
	UserRole,
} from "@/lib/constants/ai";
import { HttpStatusCode } from "@/lib/constants/ui.constants";
import createSupabaseServerClient from "@/lib/supabase/server";
import { sanitizeHistory } from "@/utils/chat.utils";
import { isSafeRemoteUrl } from "@/utils/url.utils";

const maxCodeLength = 50_000;
const maxPromptLength = 4_000;

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

const stripMarkdownCodeFences = (text: string): string => {
	const trimmed = text.trim();
	const codeBlockRegex = /^```[\w]*\n?([\s\S]*?)```\s*$/;
	const match = trimmed.match(codeBlockRegex);

	return match ? match[1].trim() : trimmed;
};

const defaultOllamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";
const ollamaCloudUrl = "https://ollama.com";
const anthropicVersion = process.env.ANTHROPIC_VERSION || "2023-06-01";
const defaultAnthropicModel =
	process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514";
const defaultOpenAIModel = process.env.OPENAI_MODEL || "gpt-4o";
const defaultNvidiaModel =
	process.env.NVIDIA_MODEL || "meta/llama-3.1-70b-instruct";
const openAiBaseUrl = "https://api.openai.com/v1";
const nvidiaBaseUrl = "https://integrate.api.nvidia.com/v1";

const resolveClaudeThinking = (
	model: string
): Record<string, unknown> | null => {
	if (claudeAdaptiveSummarizedPattern.test(model)) {
		return { type: "adaptive", display: "summarized" };
	}

	if (claudeAdaptivePattern.test(model)) {
		return { type: "adaptive" };
	}

	if (claudeExtendedThinkingPattern.test(model)) {
		return { type: "enabled", budget_tokens: claudeThinkingBudgetTokens };
	}

	return null;
};

const ollamaContextWindowCache = new Map<string, number>();

const fetchOllamaContextWindow = async (
	baseUrl: string,
	model: string,
	apiKey: string | undefined
): Promise<number> => {
	const cacheKey = `${baseUrl}::${model}`;
	const cached = ollamaContextWindowCache.get(cacheKey);

	if (typeof cached === "number") {
		return cached;
	}

	try {
		const headers: Record<string, string> = {
			"Content-Type": "application/json",
		};

		if (apiKey) {
			headers["Authorization"] = `Bearer ${apiKey}`;
		}

		const response = await fetch(`${baseUrl}/api/show`, {
			method: "POST",
			headers,
			body: JSON.stringify({ name: model }),
		});

		if (!response.ok) {
			ollamaContextWindowCache.set(cacheKey, 0);

			return 0;
		}

		const data = await response.json();
		const modelInfo = (data.model_info as Record<string, unknown>) ?? {};
		const contextEntry = Object.entries(modelInfo).find(([key]) =>
			key.endsWith(".context_length")
		);
		const contextLength =
			typeof contextEntry?.[1] === "number" ? (contextEntry[1] as number) : 0;

		ollamaContextWindowCache.set(cacheKey, contextLength);

		return contextLength;
	} catch {
		ollamaContextWindowCache.set(cacheKey, 0);

		return 0;
	}
};

const streamEncoder = new TextEncoder();

const createStreamResponse = (
	pump: (emit: AiStreamEmit) => Promise<void>
): Response => {
	const stream = new ReadableStream<Uint8Array>({
		start: async (controller) => {
			const emit: AiStreamEmit = (event) => {
				controller.enqueue(streamEncoder.encode(`${JSON.stringify(event)}\n`));
			};

			try {
				await pump(emit);
			} catch (streamError) {
				const message =
					streamError instanceof Error
						? streamError.message
						: "AI stream failed";

				emit({ type: AiStreamEventType.Error, error: message });
			} finally {
				controller.close();
			}
		},
	});

	return new Response(stream, {
		headers: {
			"Cache-Control": "no-cache, no-transform",
			"Content-Type": "application/x-ndjson; charset=utf-8",
		},
	});
};

const readLines = async (
	upstream: Response,
	onLine: (line: string) => void
): Promise<void> => {
	const reader = upstream.body?.getReader();

	if (!reader) {
		throw new Error("AI provider returned an empty response stream");
	}

	const decoder = new TextDecoder();
	let buffer = "";

	for (;;) {
		const { done, value } = await reader.read();

		if (done) {
			break;
		}

		buffer += decoder.decode(value, { stream: true });

		let newlineIndex = buffer.indexOf("\n");

		while (newlineIndex !== -1) {
			onLine(buffer.slice(0, newlineIndex));
			buffer = buffer.slice(newlineIndex + 1);
			newlineIndex = buffer.indexOf("\n");
		}
	}

	if (buffer.trim().length > 0) {
		onLine(buffer);
	}
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

const connectOllama = async (
	messages: AiHistoryMessage[],
	systemPrompt: string,
	model: string,
	baseUrl: string,
	apiKey: string | undefined
): Promise<Response> => {
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
	};

	if (apiKey) {
		headers["Authorization"] = `Bearer ${apiKey}`;
	}

	const requestOnce = async (withThinking: boolean): Promise<Response> => {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), ollamaTimeout);

		try {
			return await fetch(`${baseUrl}/api/chat`, {
				method: "POST",
				headers,
				body: JSON.stringify({
					model,
					messages: [
						{ role: UserRole.System, content: systemPrompt },
						...messages,
					],
					stream: true,
					...(withThinking ? { think: true } : {}),
				}),
				signal: controller.signal,
			});
		} finally {
			clearTimeout(timeoutId);
		}
	};

	// Models without reasoning support reject `think`; retry once without it.
	const thinkingResponse = await requestOnce(true);

	if (thinkingResponse.ok) {
		return thinkingResponse;
	}

	const plainResponse = await requestOnce(false);

	if (!plainResponse.ok) {
		throw new Error("Ollama request failed");
	}

	return plainResponse;
};

const pumpOllamaStream = async (
	upstream: Response,
	emit: AiStreamEmit
): Promise<AiStreamOutcome> => {
	let text = "";
	let thinking = "";
	let inputTokens = 0;
	let outputTokens = 0;

	await readLines(upstream, (line) => {
		const trimmed = line.trim();

		if (!trimmed) {
			return;
		}

		try {
			const chunk = JSON.parse(trimmed);
			const thinkingDelta = chunk?.message?.thinking;
			const textDelta = chunk?.message?.content;

			if (typeof thinkingDelta === "string" && thinkingDelta.length > 0) {
				thinking += thinkingDelta;
				emit({ type: AiStreamEventType.Thinking, delta: thinkingDelta });
			}

			if (typeof textDelta === "string" && textDelta.length > 0) {
				text += textDelta;
				emit({ type: AiStreamEventType.Text, delta: textDelta });
			}

			if (chunk?.done === true) {
				inputTokens =
					typeof chunk.prompt_eval_count === "number"
						? chunk.prompt_eval_count
						: 0;
				outputTokens =
					typeof chunk.eval_count === "number" ? chunk.eval_count : 0;
			}
		} catch {
			// Skip malformed stream lines.
		}
	});

	return { text, thinking, inputTokens, outputTokens };
};

const connectClaude = async (
	messages: AiHistoryMessage[],
	systemPrompt: string,
	apiKey: string,
	model: string = defaultAnthropicModel
): Promise<Response> => {
	const thinking = resolveClaudeThinking(model);

	const requestOnce = (withThinking: boolean): Promise<Response> =>
		fetch("https://api.anthropic.com/v1/messages", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"x-api-key": apiKey,
				"anthropic-version": anthropicVersion,
			},
			body: JSON.stringify({
				model,
				max_tokens: claudeMaxOutputTokens,
				stream: true,
				system: systemPrompt,
				messages,
				...(withThinking && thinking ? { thinking } : {}),
			}),
		});

	const firstResponse = await requestOnce(true);

	if (firstResponse.ok) {
		return firstResponse;
	}

	// Thinking support varies across model generations; retry without it.
	const retryResponse = thinking ? await requestOnce(false) : firstResponse;

	if (!retryResponse.ok) {
		const errorData = await retryResponse.json().catch(() => ({}));

		throw new Error(errorData?.error?.message || "Claude API request failed");
	}

	return retryResponse;
};

const pumpClaudeStream = async (
	upstream: Response,
	emit: AiStreamEmit
): Promise<AiStreamOutcome> => {
	let text = "";
	let thinking = "";

	await readLines(upstream, (line) => {
		if (!line.startsWith(ssePrefix)) {
			return;
		}

		const payload = line.slice(ssePrefix.length).trim();

		if (!payload) {
			return;
		}

		try {
			const chunk = JSON.parse(payload);

			if (chunk?.type !== claudeContentBlockDeltaEvent) {
				return;
			}

			const delta = chunk?.delta;
			const isThinkingDelta =
				delta?.type === claudeThinkingDeltaType &&
				typeof delta?.thinking === "string" &&
				delta.thinking.length > 0;
			const isTextDelta =
				delta?.type === claudeTextDeltaType &&
				typeof delta?.text === "string" &&
				delta.text.length > 0;

			if (isThinkingDelta) {
				thinking += delta.thinking;
				emit({ type: AiStreamEventType.Thinking, delta: delta.thinking });
			}

			if (isTextDelta) {
				text += delta.text;
				emit({ type: AiStreamEventType.Text, delta: delta.text });
			}
		} catch {
			// Skip malformed stream lines.
		}
	});

	return { text, thinking, inputTokens: 0, outputTokens: 0 };
};

const connectOpenAiCompatible = async (
	baseUrl: string,
	providerLabel: string,
	messages: AiHistoryMessage[],
	systemPrompt: string,
	apiKey: string,
	model: string
): Promise<Response> => {
	const response = await fetch(`${baseUrl}/chat/completions`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`,
		},
		body: JSON.stringify({
			model,
			max_tokens: maxOutputTokens,
			stream: true,
			messages: [{ role: UserRole.System, content: systemPrompt }, ...messages],
		}),
	});

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));

		throw new Error(
			errorData?.error?.message || `${providerLabel} API request failed`
		);
	}

	return response;
};

const pumpOpenAiCompatibleStream = async (
	upstream: Response,
	emit: AiStreamEmit
): Promise<AiStreamOutcome> => {
	let text = "";
	let thinking = "";

	await readLines(upstream, (line) => {
		if (!line.startsWith(ssePrefix)) {
			return;
		}

		const payload = line.slice(ssePrefix.length).trim();

		if (!payload || payload === sseDoneSentinel) {
			return;
		}

		try {
			const chunk = JSON.parse(payload);
			const delta = chunk?.choices?.[0]?.delta;
			// Reasoning models on OpenAI-compatible hosts (e.g. NVIDIA) expose
			// chain-of-thought through the non-standard reasoning_content field.
			const reasoningDelta = delta?.reasoning_content;
			const textDelta = delta?.content;

			if (typeof reasoningDelta === "string" && reasoningDelta.length > 0) {
				thinking += reasoningDelta;
				emit({ type: AiStreamEventType.Thinking, delta: reasoningDelta });
			}

			if (typeof textDelta === "string" && textDelta.length > 0) {
				text += textDelta;
				emit({ type: AiStreamEventType.Text, delta: textDelta });
			}
		} catch {
			// Skip malformed stream lines.
		}
	});

	return { text, thinking, inputTokens: 0, outputTokens: 0 };
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
		const aiProvider = (metadata.ai_provider as string) || "ollama";
		const aiApiKey = (metadata.ai_api_key as string) || "";
		const aiModel = (metadata.ai_model as string) || "";
		const aiUrl = (metadata.ai_url as string) || "";

		// OpenAI provider
		if (aiProvider === "openai") {
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
				openaiModel
			);

			return createStreamResponse(async (emit) => {
				const outcome = await pumpOpenAiCompatibleStream(upstream, emit);

				emitDone(emit, outcome, stripFences, "openai", openaiModel);
			});
		}

		// NVIDIA provider (OpenAI-compatible)
		if (aiProvider === "nvidia") {
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
				nvidiaModel
			);

			return createStreamResponse(async (emit) => {
				const outcome = await pumpOpenAiCompatibleStream(upstream, emit);

				emitDone(emit, outcome, stripFences, "nvidia", nvidiaModel);
			});
		}

		// Claude provider (explicit)
		if (aiProvider === "claude") {
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
				claudeModel
			);

			return createStreamResponse(async (emit) => {
				const outcome = await pumpClaudeStream(upstream, emit);

				emitDone(emit, outcome, stripFences, "claude", claudeModel);
			});
		}

		// Ollama provider (default) with Claude fallback
		const ollamaModel = aiModel || process.env.OLLAMA_MODEL || "codellama";

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
				ollamaApiKey
			);

			return createStreamResponse(async (emit) => {
				const outcome = await pumpOllamaStream(upstream, emit);
				const contextWindow = await fetchOllamaContextWindow(
					ollamaUrl,
					ollamaModel,
					ollamaApiKey
				);

				emitDone(emit, outcome, stripFences, "ollama", ollamaModel, {
					inputTokens: outcome.inputTokens,
					outputTokens: outcome.outputTokens,
					contextWindow,
				});
			});
		} catch (ollamaError) {
			attempts.push({
				provider: "ollama",
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
					ollamaApiKey
				);

				return createStreamResponse(async (emit) => {
					const outcome = await pumpOllamaStream(upstream, emit);
					const contextWindow = await fetchOllamaContextWindow(
						ollamaCloudUrl,
						ollamaModel,
						ollamaApiKey
					);

					emitDone(emit, outcome, stripFences, "ollama-cloud", ollamaModel, {
						inputTokens: outcome.inputTokens,
						outputTokens: outcome.outputTokens,
						contextWindow,
					});
				});
			} catch (ollamaCloudError) {
				attempts.push({
					provider: "ollama-cloud",
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
				fallbackApiKey
			);

			return createStreamResponse(async (emit) => {
				const outcome = await pumpClaudeStream(upstream, emit);

				emitDone(emit, outcome, stripFences, "claude", defaultAnthropicModel);
			});
		} catch (claudeError) {
			attempts.push({
				provider: "claude",
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
