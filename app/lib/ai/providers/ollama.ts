import {
	AiStreamEventType,
	ollamaContextWindowCache,
	ollamaContextWindowCacheLimit,
	ollamaTimeout,
	UserRole,
} from "@/lib/constants/ai";
import { readResponseLines } from "@/lib/ai/streamLines";

const rememberContextWindow = (cacheKey: string, value: number): void => {
	if (value <= 0) {
		return;
	}

	if (ollamaContextWindowCache.size >= ollamaContextWindowCacheLimit) {
		const oldestKey = ollamaContextWindowCache.keys().next().value;

		if (oldestKey !== undefined) {
			ollamaContextWindowCache.delete(oldestKey);
		}
	}

	ollamaContextWindowCache.set(cacheKey, value);
};

export const fetchOllamaContextWindow = async (
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
			return 0;
		}

		const data = await response.json();
		const modelInfo = (data.model_info as Record<string, unknown>) ?? {};
		const contextEntry = Object.entries(modelInfo).find(([key]) =>
			key.endsWith(".context_length")
		);
		const contextLength =
			typeof contextEntry?.[1] === "number" ? (contextEntry[1] as number) : 0;

		rememberContextWindow(cacheKey, contextLength);

		return contextLength;
	} catch {
		return 0;
	}
};

export const connectOllama = async (
	messages: AiHistoryMessage[],
	systemPrompt: string,
	model: string,
	baseUrl: string,
	apiKey: string | undefined,
	abortSignal?: AbortSignal
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
		const handleAbort = (): void => controller.abort();

		if (abortSignal?.aborted) {
			controller.abort();
		} else {
			abortSignal?.addEventListener("abort", handleAbort, { once: true });
		}

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
			abortSignal?.removeEventListener("abort", handleAbort);
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

export const pumpOllamaStream = async (
	upstream: Response,
	emit: AiStreamEmit
): Promise<AiStreamOutcome> => {
	let text = "";
	let thinking = "";
	let inputTokens = 0;
	let outputTokens = 0;

	await readResponseLines(upstream, (line) => {
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
