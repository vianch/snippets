import {
	AiStreamEventType,
	maxOutputTokens,
	sseDoneSentinel,
	ssePrefix,
	UserRole,
} from "@/lib/constants/ai";
import { readResponseLines } from "@/lib/ai/streamLines";

export const connectOpenAiCompatible = async (
	baseUrl: string,
	providerLabel: string,
	messages: AiHistoryMessage[],
	systemPrompt: string,
	apiKey: string,
	model: string,
	abortSignal?: AbortSignal,
	extraHeaders?: Record<string, string>
): Promise<Response> => {
	const response = await fetch(`${baseUrl}/chat/completions`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`,
			...extraHeaders,
		},
		body: JSON.stringify({
			model,
			max_tokens: maxOutputTokens,
			stream: true,
			messages: [{ role: UserRole.System, content: systemPrompt }, ...messages],
		}),
		signal: abortSignal,
	});

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));

		throw new Error(
			errorData?.error?.message || `${providerLabel} API request failed`
		);
	}

	return response;
};

export const pumpOpenAiCompatibleStream = async (
	upstream: Response,
	emit: AiStreamEmit
): Promise<AiStreamOutcome> => {
	let text = "";
	let thinking = "";

	await readResponseLines(upstream, (line) => {
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
