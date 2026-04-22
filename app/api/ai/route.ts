import { NextRequest, NextResponse } from "next/server";

import { aiActions, aiSystemPrompts } from "@/lib/constants/ai";

export const maxDuration = 60;

const validActions: AiAction[] = [
	aiActions.explain,
	aiActions.comments,
	aiActions.format,
	aiActions.optimize,
	aiActions.json,
	aiActions.ask,
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
const anthropicModel =
	process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514";

const ollamaTimeout = 55000;

const requestOllama = async (
	prompt: string,
	systemPrompt: string,
	model: string,
	baseUrl: string,
	apiKey: string | undefined,
	stripFences: boolean
): Promise<string> => {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), ollamaTimeout);
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
	};

	if (apiKey) {
		headers["Authorization"] = `Bearer ${apiKey}`;
	}

	const response = await fetch(`${baseUrl}/api/generate`, {
		method: "POST",
		headers,
		body: JSON.stringify({
			model,
			prompt,
			system: systemPrompt,
			stream: false,
		}),
		signal: controller.signal,
	});

	clearTimeout(timeoutId);

	if (!response.ok) {
		throw new Error("Ollama request failed");
	}

	const data = await response.json();
	const responseText = data.response as string;

	return stripFences ? stripMarkdownCodeFences(responseText) : responseText;
};

const requestClaude = async (
	prompt: string,
	systemPrompt: string,
	apiKey: string,
	stripFences: boolean
): Promise<string> => {
	const response = await fetch("https://api.anthropic.com/v1/messages", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"x-api-key": apiKey,
			"anthropic-version": anthropicVersion,
		},
		body: JSON.stringify({
			model: anthropicModel,
			max_tokens: 4096,
			system: systemPrompt,
			messages: [{ role: "user", content: prompt }],
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

const buildAskSystemPrompt = (language: string, code: string): string => {
	const base = aiSystemPrompts.ask(language || "unknown");

	return `${base}\n\nHere is the ${language || "code"} snippet:\n\`\`\`${language || ""}\n${code}\n\`\`\``;
};

export const POST = async (request: NextRequest): Promise<NextResponse> => {
	try {
		const body = (await request.json()) as AiRequest;
		const { action, code, language, userPrompt } = body;

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

		const isAskAction = action === aiActions.ask;

		if (isAskAction && (!userPrompt || userPrompt.trim().length === 0)) {
			return NextResponse.json(
				{ error: "userPrompt is required for the ask action" },
				{ status: 400 }
			);
		}

		const systemPrompt = isAskAction
			? buildAskSystemPrompt(language || "unknown", code)
			: aiSystemPrompts[action](language || "unknown");
		const prompt = isAskAction ? (userPrompt as string) : code;
		const stripFences = !isAskAction;
		const ollamaModel =
			request.headers.get("x-ollama-model") ||
			process.env.OLLAMA_MODEL ||
			"codellama";
		const ollamaUrl = request.headers.get("x-ollama-url") || defaultOllamaUrl;
		const ollamaApiKey =
			request.headers.get("x-ollama-api-key") ||
			process.env.OLLAMA_API_KEY ||
			undefined;

		// 1. Try custom Ollama URL (tunnel or local)
		try {
			const result = await requestOllama(
				prompt,
				systemPrompt,
				ollamaModel,
				ollamaUrl,
				ollamaApiKey,
				stripFences
			);

			return NextResponse.json({ result, provider: "ollama" });
		} catch (_ollamaError) {
			// Custom Ollama URL failed
		}

		// 2. Try Ollama Cloud directly with API key
		if (ollamaApiKey && ollamaUrl !== ollamaCloudUrl) {
			try {
				const result = await requestOllama(
					prompt,
					systemPrompt,
					ollamaModel,
					ollamaCloudUrl,
					ollamaApiKey,
					stripFences
				);

				return NextResponse.json({ result, provider: "ollama-cloud" });
			} catch (_ollamaCloudError) {
				// Ollama Cloud failed
			}
		}

		// 3. Fallback to Claude API
		const apiKey =
			request.headers.get("x-ai-api-key") ||
			process.env.ANTHROPIC_API_KEY ||
			"";

		if (!apiKey) {
			return NextResponse.json(
				{
					error:
						"No AI provider configured. Set up your Ollama URL or API key in Account Settings > AI tab.",
				},
				{ status: 503 }
			);
		}

		const result = await requestClaude(
			prompt,
			systemPrompt,
			apiKey,
			stripFences
		);

		return NextResponse.json({ result, provider: "claude" });
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "An unexpected error occurred";

		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
};
