import {
	AiStreamEventType,
	anthropicVersion,
	claudeAdaptivePattern,
	claudeAdaptiveSummarizedPattern,
	claudeContentBlockDeltaEvent,
	claudeExtendedThinkingPattern,
	claudeMaxOutputTokens,
	claudeTextDeltaType,
	claudeThinkingBudgetTokens,
	claudeThinkingDeltaType,
	defaultAnthropicModel,
	ssePrefix,
} from "@/lib/constants/ai";
import { readResponseLines } from "@/lib/ai/streamLines";

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

export const connectClaude = async (
	messages: AiHistoryMessage[],
	systemPrompt: string,
	apiKey: string,
	model: string = defaultAnthropicModel,
	abortSignal?: AbortSignal
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
			signal: abortSignal,
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

export const pumpClaudeStream = async (
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
