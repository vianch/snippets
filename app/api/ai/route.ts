import { NextRequest, NextResponse } from "next/server";

import { aiActions, aiSystemPrompts, UserRole } from "@/lib/constants/ai";
import createSupabaseServerClient from "@/lib/supabase/server";
import { sanitizeHistory } from "@/utils/chat.utils";

const maxCodeLength = 50_000;
const maxPromptLength = 4_000;

export const maxDuration = 60;

const validActions: AiAction[] = [
	aiActions.explain,
	aiActions.comments,
	aiActions.format,
	aiActions.optimize,
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

const ollamaTimeout = 55000;

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

const requestOllama = async (
	messages: AiHistoryMessage[],
	systemPrompt: string,
	model: string,
	baseUrl: string,
	apiKey: string | undefined,
	stripFences: boolean
): Promise<OllamaResult> => {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), ollamaTimeout);
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
	};

	if (apiKey) {
		headers["Authorization"] = `Bearer ${apiKey}`;
	}

	const response = await fetch(`${baseUrl}/api/chat`, {
		method: "POST",
		headers,
		body: JSON.stringify({
			model,
			messages: [{ role: UserRole.System, content: systemPrompt }, ...messages],
			stream: false,
		}),
		signal: controller.signal,
	});

	clearTimeout(timeoutId);

	if (!response.ok) {
		throw new Error("Ollama request failed");
	}

	const data = await response.json();
	const responseText = (data.message?.content as string) || "";

	return {
		text: stripFences ? stripMarkdownCodeFences(responseText) : responseText,
		inputTokens:
			typeof data.prompt_eval_count === "number" ? data.prompt_eval_count : 0,
		outputTokens: typeof data.eval_count === "number" ? data.eval_count : 0,
	};
};

const requestClaude = async (
	messages: AiHistoryMessage[],
	systemPrompt: string,
	apiKey: string,
	stripFences: boolean,
	model: string = defaultAnthropicModel
): Promise<string> => {
	const response = await fetch("https://api.anthropic.com/v1/messages", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"x-api-key": apiKey,
			"anthropic-version": anthropicVersion,
		},
		body: JSON.stringify({
			model,
			max_tokens: 4096,
			system: systemPrompt,
			messages,
		}),
	});

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));

		throw new Error(errorData?.error?.message || "Claude API request failed");
	}

	const data = await response.json();
	const textBlock = data.content?.find(
		(block: { type: string }) => block.type === "text"
	);
	const responseText = textBlock?.text || "";

	return stripFences ? stripMarkdownCodeFences(responseText) : responseText;
};

const requestOpenAI = async (
	messages: AiHistoryMessage[],
	systemPrompt: string,
	apiKey: string,
	stripFences: boolean,
	model: string = defaultOpenAIModel
): Promise<string> => {
	const response = await fetch("https://api.openai.com/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`,
		},
		body: JSON.stringify({
			model,
			max_tokens: 4096,
			messages: [{ role: UserRole.System, content: systemPrompt }, ...messages],
		}),
	});

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));

		throw new Error(errorData?.error?.message || "OpenAI API request failed");
	}

	const data = await response.json();
	const responseText = data.choices?.[0]?.message?.content || "";

	return stripFences ? stripMarkdownCodeFences(responseText) : responseText;
};

const buildAskSystemPrompt = (language: string, code: string): string => {
	const base = aiSystemPrompts.ask(language || "unknown");

	return `${base}\n\nHere is the ${language || "code"} snippet:\n\`\`\`${language || ""}\n${code}\n\`\`\``;
};

export const POST = async (request: NextRequest): Promise<NextResponse> => {
	try {
		const { supabase } = await createSupabaseServerClient(request);
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = (await request.json()) as AiRequest;
		const { action, code, language, userPrompt, history } = body;

		if (!action || !validActions.includes(action)) {
			return NextResponse.json(
				{
					error:
						"Invalid action. Must be one of: explain, comments, format, optimize, json, ask",
				},
				{ status: 400 }
			);
		}

		if (!code || code.trim().length === 0) {
			return NextResponse.json({ error: "Code is required" }, { status: 400 });
		}

		if (code.length > maxCodeLength) {
			return NextResponse.json(
				{ error: `Code exceeds ${maxCodeLength} character limit` },
				{ status: 413 }
			);
		}

		const isAskAction = action === aiActions.ask;

		if (isAskAction && (!userPrompt || userPrompt.trim().length === 0)) {
			return NextResponse.json(
				{ error: "userPrompt is required for the ask action" },
				{ status: 400 }
			);
		}

		if (isAskAction && userPrompt && userPrompt.length > maxPromptLength) {
			return NextResponse.json(
				{ error: `Prompt exceeds ${maxPromptLength} character limit` },
				{ status: 413 }
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
					{ status: 503 }
				);
			}

			const openaiModel = aiModel || defaultOpenAIModel;
			const result = await requestOpenAI(
				messages,
				systemPrompt,
				openaiApiKey,
				stripFences,
				openaiModel
			);

			return NextResponse.json({
				result,
				provider: "openai",
				model: openaiModel,
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
					{ status: 503 }
				);
			}

			const claudeModel = aiModel || defaultAnthropicModel;
			const result = await requestClaude(
				messages,
				systemPrompt,
				claudeApiKey,
				stripFences,
				claudeModel
			);

			return NextResponse.json({
				result,
				provider: "claude",
				model: claudeModel,
			});
		}

		// Ollama provider (default) with Claude fallback
		const ollamaModel = aiModel || process.env.OLLAMA_MODEL || "codellama";
		const ollamaUrl = aiUrl || defaultOllamaUrl;
		const ollamaApiKey = aiApiKey || process.env.OLLAMA_API_KEY || undefined;
		const attempts: Array<{ provider: string; error: string }> = [];

		// 1. Try custom Ollama URL (tunnel or local)
		try {
			const ollamaResult = await requestOllama(
				messages,
				systemPrompt,
				ollamaModel,
				ollamaUrl,
				ollamaApiKey,
				stripFences
			);
			const contextWindow = await fetchOllamaContextWindow(
				ollamaUrl,
				ollamaModel,
				ollamaApiKey
			);

			return NextResponse.json({
				result: ollamaResult.text,
				provider: "ollama",
				model: ollamaModel,
				usage: {
					inputTokens: ollamaResult.inputTokens,
					outputTokens: ollamaResult.outputTokens,
					contextWindow,
				},
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
				const ollamaCloudResult = await requestOllama(
					messages,
					systemPrompt,
					ollamaModel,
					ollamaCloudUrl,
					ollamaApiKey,
					stripFences
				);
				const contextWindow = await fetchOllamaContextWindow(
					ollamaCloudUrl,
					ollamaModel,
					ollamaApiKey
				);

				return NextResponse.json({
					result: ollamaCloudResult.text,
					provider: "ollama-cloud",
					model: ollamaModel,
					usage: {
						inputTokens: ollamaCloudResult.inputTokens,
						outputTokens: ollamaCloudResult.outputTokens,
						contextWindow,
					},
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
				{ status: 503 }
			);
		}

		try {
			const result = await requestClaude(
				messages,
				systemPrompt,
				fallbackApiKey,
				stripFences
			);

			return NextResponse.json({
				result,
				provider: "claude",
				model: defaultAnthropicModel,
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
				{ status: 502 }
			);
		}
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "An unexpected error occurred";

		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
};
