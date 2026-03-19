export const aiActions = {
	explain: "explain",
	comments: "comments",
	format: "format",
	optimize: "optimize",
	json: "json",
} as const;

export const aiActionLabels: Record<AiAction, string> = {
	explain: "Explain this code",
	comments: "Add comments",
	format: "Format this code",
	optimize: "Optimize",
	json: "JSON parse & format",
};

export const aiSystemPrompts: Record<AiAction, (language: string) => string> = {
	explain: (language) =>
		`You are a code expert. Explain what this ${language} code does in clear, concise terms. Use bullet points for each logical section.`,
	comments: (language) =>
		`Add inline comments to this ${language} code. Return ONLY the commented code. No explanation, no markdown, no code fences. Preserve original formatting.`,
	format: (language) =>
		`Format this ${language} code following standard conventions and best practices for indentation, spacing, and line breaks. Return ONLY the raw formatted code. No explanation, no markdown, no code fences.`,
	optimize: (language) =>
		`Optimize this ${language} code for readability and performance. Return ONLY the raw optimized code. No markdown, no code fences, no explanation outside the code. You may add a brief inline comment at the top explaining what changed.`,
	json: (_language) =>
		"Fix this invalid JSON. Correct syntax errors like missing commas, brackets, quotes, or trailing commas. Return ONLY the valid, formatted JSON. No explanation, no markdown, no code fences.",
};

export const codeActions: AiAction[] = [
	"comments",
	"format",
	"optimize",
	"json",
];

export const localActions: AiAction[] = ["json"];
