import { aiActions, AiProviderId, AiStreamEventType } from "@/lib/constants/ai";
import { readLines } from "@/lib/ai/streamLines";
import { stripMarkdownCodeFences } from "@/utils/string.utils";

export const fetchAiModels = async (
	provider: AiProvider,
	options: FetchAiModelsOptions = {}
): Promise<FetchAiModelsResult> => {
	try {
		const params = new URLSearchParams({ provider });
		const headers: Record<string, string> = {};

		if (
			provider === AiProviderId.Claude ||
			provider === AiProviderId.OpenAi ||
			provider === AiProviderId.OpenRouter
		) {
			if (options.apiKey) {
				headers["x-api-key"] = options.apiKey;
			}
		} else {
			if (options.ollamaUrl) {
				params.set("ollama_url", options.ollamaUrl);
			}

			if (options.ollamaApiKey) {
				headers["x-api-key"] = options.ollamaApiKey;
			}
		}

		const response = await fetch(`/api/ai/models?${params.toString()}`, {
			headers,
		});
		const data = await response.json();

		return { models: data.models || [], error: data.error };
	} catch (_error) {
		return { models: [] };
	}
};

export const formatTokens = (count: number): string => {
	if (count >= 1000) {
		return `${(count / 1000).toFixed(count >= 10_000 ? 0 : 1)}k`;
	}

	return count.toString();
};

// Turns a raw provider model id into a readable label, e.g.
// "claude-opus-4-20250514" -> "Claude Opus 4", "gpt-4o-mini" -> "Gpt 4o Mini".
export const formatModelLabel = (model: string): string => {
	if (!model) {
		return "";
	}

	const withoutDate = model.replace(/[-_]\d{6,8}$/, "");
	const words = withoutDate
		.split(/[-_/]/)
		.filter((part) => part.length > 0)
		.map((part) =>
			/^\d/.test(part) ? part : part.charAt(0).toUpperCase() + part.slice(1)
		);

	return words.join(" ") || model;
};

export const fetchOllamaModels = async (
	ollamaUrl?: string,
	ollamaApiKey?: string
): Promise<string[]> => {
	const result = await fetchAiModels(AiProviderId.Ollama, {
		ollamaUrl,
		ollamaApiKey,
	});

	return result.models;
};

export const requestAiAction = async (
	action: AiAction,
	code: string,
	language: string,
	options: RequestAiActionOptions = {}
): Promise<AiResponse> => {
	const { userPrompt, signal, history, onThinkingDelta, onTextDelta } = options;

	const response = await fetch("/api/ai", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ action, code, language, userPrompt, history }),
		signal,
	});

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));
		const errorMessage =
			errorData?.error || `AI request failed with status ${response.status}`;

		throw new Error(errorMessage);
	}

	const contentType = response.headers.get("content-type") ?? "";

	if (!contentType.includes("ndjson") || !response.body) {
		return response.json();
	}

	const reader = response.body.getReader();
	let streamedText = "";
	let streamedThinking = "";
	let finalResponse: AiResponse | null = null;

	const parseLine = (line: string): AiStreamEvent | null => {
		const trimmed = line.trim();

		if (!trimmed) {
			return null;
		}

		try {
			// Each NDJSON line emitted by /api/ai is a serialized AiStreamEvent.
			return JSON.parse(trimmed) as AiStreamEvent;
		} catch {
			return null;
		}
	};

	const handleLine = (line: string): void => {
		const event = parseLine(line);

		if (!event) {
			return;
		}

		if (event.type === AiStreamEventType.Thinking) {
			streamedThinking += event.delta;
			onThinkingDelta?.(event.delta);
		} else if (event.type === AiStreamEventType.Text) {
			streamedText += event.delta;
			onTextDelta?.(event.delta);
		} else if (event.type === AiStreamEventType.Done) {
			finalResponse = {
				result: event.result,
				thinking: event.thinking,
				provider: event.provider,
				model: event.model,
				usage: event.usage,
			};
		} else if (event.type === AiStreamEventType.Error) {
			throw new Error(event.error);
		}
	};

	await readLines(reader, handleLine, () => Boolean(signal?.aborted));

	if (finalResponse !== null) {
		return finalResponse;
	}

	if (streamedText.trim().length > 0) {
		return {
			result:
				action === aiActions.ask
					? streamedText
					: stripMarkdownCodeFences(streamedText),
			thinking: streamedThinking || undefined,
		};
	}

	throw new Error("AI stream ended without a result");
};
