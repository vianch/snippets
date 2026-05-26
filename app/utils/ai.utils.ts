type FetchAiModelsOptions = {
	apiKey?: string;
	ollamaUrl?: string;
	ollamaApiKey?: string;
};

type FetchAiModelsResult = {
	models: string[];
	error?: string;
};

export const fetchAiModels = async (
	provider: AiProvider,
	options: FetchAiModelsOptions = {}
): Promise<FetchAiModelsResult> => {
	try {
		const params = new URLSearchParams({ provider });
		const headers: Record<string, string> = {};

		if (provider === "claude" || provider === "openai") {
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

export const fetchOllamaModels = async (
	ollamaUrl?: string,
	ollamaApiKey?: string
): Promise<string[]> => {
	const result = await fetchAiModels("ollama", { ollamaUrl, ollamaApiKey });

	return result.models;
};

type RequestAiActionOptions = {
	userPrompt?: string;
	signal?: AbortSignal;
	history?: AiHistoryMessage[];
};

export const requestAiAction = async (
	action: AiAction,
	code: string,
	language: string,
	options: RequestAiActionOptions = {}
): Promise<AiResponse> => {
	const { userPrompt, signal, history } = options;

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

	return response.json();
};
