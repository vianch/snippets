import { NextRequest, NextResponse } from "next/server";

import { aiSystemPrompts } from "@/lib/constants/ai";

const validActions: AiAction[] = ["explain", "comments", "format", "optimize"];

const defaultOllamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";
const anthropicVersion = process.env.ANTHROPIC_VERSION || "2023-06-01";
const anthropicModel =
	process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514";

const ollamaTimeout = 60000;

const requestOllama = async (
	prompt: string,
	systemPrompt: string,
	model: string,
	baseUrl: string,
	apiKey?: string
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

	return data.response;
};

const requestClaude = async (
	prompt: string,
	systemPrompt: string,
	apiKey: string
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

	return textBlock?.text || "";
};

export const POST = async (request: NextRequest): Promise<NextResponse> => {
	try {
		const body = (await request.json()) as AiRequest;
		const { action, code, language } = body;

		if (!action || !validActions.includes(action)) {
			return NextResponse.json(
				{
					error:
						"Invalid action. Must be one of: explain, comments, format, optimize",
				},
				{ status: 400 }
			);
		}

		if (!code || code.trim().length === 0) {
			return NextResponse.json({ error: "Code is required" }, { status: 400 });
		}

		const systemPrompt = aiSystemPrompts[action](language || "unknown");
		const prompt = code;
		const ollamaModel =
			request.headers.get("x-ollama-model") ||
			process.env.OLLAMA_MODEL ||
			"codellama";
		const ollamaUrl = request.headers.get("x-ollama-url") || defaultOllamaUrl;
		const ollamaApiKey =
			request.headers.get("x-ollama-api-key") ||
			process.env.OLLAMA_API_KEY ||
			undefined;

		// Try Ollama first, fallback to Claude
		let ollamaErrorMessage = "";

		try {
			const result = await requestOllama(
				prompt,
				systemPrompt,
				ollamaModel,
				ollamaUrl,
				ollamaApiKey
			);

			return NextResponse.json({ result, provider: "ollama" });
		} catch (ollamaError) {
			ollamaErrorMessage =
				ollamaError instanceof Error
					? ollamaError.message
					: "Unknown Ollama error";
		}

		// Ollama failed, try Claude
		const apiKey =
			request.headers.get("x-ai-api-key") ||
			process.env.ANTHROPIC_API_KEY ||
			"";

		if (!apiKey) {
			return NextResponse.json(
				{
					error: `AI not available. Ollama failed (${ollamaErrorMessage}) at ${ollamaUrl} with model ${ollamaModel}. No Anthropic API key configured as fallback.`,
				},
				{ status: 503 }
			);
		}

		const result = await requestClaude(prompt, systemPrompt, apiKey);

		return NextResponse.json({ result, provider: "claude" });
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "An unexpected error occurred";

		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
};
