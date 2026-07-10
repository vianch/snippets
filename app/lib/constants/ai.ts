export const aiActions = {
	explain: "explain",
	comments: "comments",
	format: "format",
	optimize: "optimize",
	refactor: "refactor",
	json: "json",
	ask: "ask",
	complete: "complete",
} as const;

export const aiActionLabels: Record<AiAction, string> = {
	explain: "Explain this code",
	comments: "Add comments",
	format: "Format this code",
	optimize: "Optimize",
	refactor: "Refactor",
	json: "JSON parse & format",
	ask: "Ask about this code",
	complete: "Inline completion",
};

export const chipActions: AiAction[] = [
	"explain",
	"comments",
	"format",
	"optimize",
	"refactor",
	"json",
];

export const aiSystemPrompts: Record<AiAction, (language: string) => string> = {
	explain: (language) =>
		`You are a code expert. Explain what this ${language} code does in clear, concise terms. Use bullet points for each logical section.`,
	comments: (language) =>
		`Add inline comments to this ${language} code. Return ONLY the commented code. No explanation, no markdown, no code fences. Preserve original formatting.`,
	format: (language) =>
		`Format this ${language} code following standard conventions and best practices for indentation, spacing, and line breaks. Return ONLY the raw formatted code. No explanation, no markdown, no code fences.`,
	optimize: (language) =>
		`Optimize this ${language} code for readability and performance. Return ONLY the raw optimized code. No markdown, no code fences, no explanation outside the code. You may add a brief inline comment at the top explaining what changed.`,
	refactor: (language) =>
		`Refactor this ${language} code to improve its structure, naming, and readability without changing its behavior. Return ONLY the raw refactored code. No markdown, no code fences, no explanation outside the code.`,
	json: (_language) =>
		"Fix this invalid JSON. Correct syntax errors like missing commas, brackets, quotes, or trailing commas. Return ONLY the valid, formatted JSON. No explanation, no markdown, no code fences.",
	ask: (language) =>
		`You are a coding assistant. The user will ask a question about a ${language} code snippet provided to you in the same system message. Answer clearly and concisely. If you include code, wrap it in fenced code blocks with the language tag.`,
	complete: (language) =>
		`You are an inline ${language} code completion assistant. The user's message is a partial code prefix; return ONLY the next 1 to 3 lines that should follow the cursor. Output raw text, no explanation, no markdown, no code fences. Preserve the existing indentation and style. If the prefix already looks complete, return an empty response.`,
};

export const codeActions: AiAction[] = [
	"comments",
	"format",
	"optimize",
	"refactor",
	"json",
];

export const localActions: AiAction[] = ["json"];

export const ContextUsageWarnThreshold = 50;
export const ContextUsageDangerThreshold = 80;
export const CodeCopyResetMs = 1500;

export const enum AiPaneTab {
	Chat = "chat",
	Code = "code",
}

export const enum AiProviderId {
	Claude = "claude",
	Nvidia = "nvidia",
	Ollama = "ollama",
	OllamaCloud = "ollama-cloud",
	OpenAi = "openai",
	OpenRouter = "openrouter",
}

export const enum SegmentType {
	Code = "code",
	Prose = "prose",
}

export const enum AiStreamEventType {
	Done = "done",
	Error = "error",
	Text = "text",
	Thinking = "thinking",
}

export const enum ChatStatus {
	Empty = "empty",
	Processing = "processing",
	Answered = "answered",
	Stopped = "stopped",
	Error = "error",
}

export const enum UserRole {
	User = "user",
	Assistant = "assistant",
	System = "system",
}

export const openAiExcludedPrefixes = [
	"text-embedding",
	"text-moderation",
	"text-search",
	"text-similarity",
	"whisper",
	"tts",
	"dall-e",
	"babbage",
	"davinci",
	"ada",
	"curie",
	"ft:gpt",
];

export const replaceIntentKeywords = [
	"refactor",
	"rewrite",
	"replace",
	"update",
	"change",
	"fix",
	"modify",
	"set",
	"substitute",
	"swap",
];

export const replaceIntentPattern = new RegExp(
	`\\b(${replaceIntentKeywords.join("|")})\\b`,
	"i"
);

export const fencedCodeBlockPattern = /```([a-zA-Z0-9_+-]*)\n([\s\S]*?)```/g;

export const aiChatModalMinWidthPx = 440;
export const aiChatModalWidthStorageKey = "aiChatModal.width";
export const ScrollPinThresholdPx = 80;

export const maxHistoryMessages = 20;

export const ollamaTimeout = 55000;
export const maxOutputTokens = 4096;
export const claudeMaxOutputTokens = 8192;
export const claudeThinkingBudgetTokens = 2048;

export const anthropicVersion = process.env.ANTHROPIC_VERSION || "2023-06-01";
export const defaultAnthropicModel =
	process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514";
export const defaultOllamaUrl =
	process.env.OLLAMA_URL || "http://localhost:11434";
export const ollamaCloudUrl = "https://ollama.com";
export const ollamaContextWindowCacheLimit = 64;
export const ollamaContextWindowCache = new Map<string, number>();
export const openAiBaseUrl = "https://api.openai.com/v1";
export const nvidiaBaseUrl = "https://integrate.api.nvidia.com/v1";
export const openRouterBaseUrl = "https://openrouter.ai/api/v1";
export const defaultOpenAIModel = process.env.OPENAI_MODEL || "gpt-4o";
export const defaultNvidiaModel =
	process.env.NVIDIA_MODEL || "meta/llama-3.1-70b-instruct";
export const defaultOpenRouterModel =
	process.env.OPENROUTER_MODEL || "openrouter/free";
export const openRouterFreeSuffix = ":free";
export const openRouterRefererUrl =
	process.env.NEXT_PUBLIC_BASE_URL || "https://snippets.vianch.com";
export const openRouterAppTitle = "Snippets";

export const ssePrefix = "data:";
export const sseDoneSentinel = "[DONE]";
export const claudeContentBlockDeltaEvent = "content_block_delta";
export const claudeThinkingDeltaType = "thinking_delta";
export const claudeTextDeltaType = "text_delta";

export const claudeAdaptiveSummarizedPattern = /fable|opus-4-[789]/;
export const claudeAdaptivePattern = /sonnet-4-[6-9]|opus-4-6/;
export const claudeExtendedThinkingPattern = /sonnet-4|opus-4|haiku-4/;
