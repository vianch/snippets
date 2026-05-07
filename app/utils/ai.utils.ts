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

export const fetchOllamaModels = async (
	ollamaUrl?: string,
	ollamaApiKey?: string
): Promise<string[]> => {
	const result = await fetchAiModels("ollama", { ollamaUrl, ollamaApiKey });

	return result.models;
};

type RequestAiActionOptions = {
	aiProvider?: AiProvider;
	aiApiKey?: string;
	aiModel?: string;
	aiUrl?: string;
	userPrompt?: string;
	signal?: AbortSignal;
};

export const requestAiAction = async (
	action: AiAction,
	code: string,
	language: string,
	options: RequestAiActionOptions = {}
): Promise<AiResponse> => {
	const { aiProvider, aiApiKey, aiModel, aiUrl, userPrompt, signal } = options;
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
	};

	if (aiProvider) {
		headers["x-ai-provider"] = aiProvider;
	}

	if (aiApiKey) {
		headers["x-ai-api-key"] = aiApiKey;
	}

	if (aiModel) {
		headers["x-ai-model"] = aiModel;
	}

	if (aiUrl) {
		headers["x-ai-url"] = aiUrl;
	}

	const response = await fetch("/api/ai", {
		method: "POST",
		headers,
		body: JSON.stringify({ action, code, language, userPrompt }),
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
