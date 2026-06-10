declare global {
	type FetchAiModelsOptions = {
		apiKey?: string;
		ollamaUrl?: string;
		ollamaApiKey?: string;
	};

	type FetchAiModelsResult = {
		models: string[];
		error?: string;
	};

	type RequestAiActionOptions = {
		userPrompt?: string;
		signal?: AbortSignal;
		history?: AiHistoryMessage[];
		onThinkingDelta?: (delta: string) => void;
		onTextDelta?: (delta: string) => void;
	};
}

export {};
