export const fetchOllamaModels = async (
	ollamaUrl?: string,
	ollamaApiKey?: string
): Promise<string[]> => {
	try {
		const params = new URLSearchParams();

		if (ollamaUrl) {
			params.set("ollama_url", ollamaUrl);
		}

		if (ollamaApiKey) {
			params.set("ollama_api_key", ollamaApiKey);
		}

		const query = params.toString() ? `?${params.toString()}` : "";
		const response = await fetch(`/api/ai/models${query}`);
		const data = await response.json();

		return data.models || [];
	} catch (_error) {
		return [];
	}
};

export const requestAiAction = async (
	action: AiAction,
	code: string,
	language: string,
	apiKey?: string,
	ollamaModel?: string,
	ollamaUrl?: string,
	ollamaApiKey?: string
): Promise<AiResponse> => {
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
	};

	if (apiKey) {
		headers["x-ai-api-key"] = apiKey;
	}

	if (ollamaModel) {
		headers["x-ollama-model"] = ollamaModel;
	}

	if (ollamaUrl) {
		headers["x-ollama-url"] = ollamaUrl;
	}

	if (ollamaApiKey) {
		headers["x-ollama-api-key"] = ollamaApiKey;
	}

	const response = await fetch("/api/ai", {
		method: "POST",
		headers,
		body: JSON.stringify({ action, code, language }),
	});

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));
		const errorMessage =
			errorData?.error || `AI request failed with status ${response.status}`;

		throw new Error(errorMessage);
	}

	return response.json();
};
