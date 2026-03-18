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
		`Add inline comments to this ${language} code. Return ONLY the commented code, no explanation. Preserve original formatting.`,
	format: (language) =>
		`Format this ${language} code following standard conventions and best practices for indentation, spacing, and line breaks. Return ONLY the formatted code, no explanation.`,
	optimize: (language) =>
		`Optimize this ${language} code for readability and performance. Return ONLY the optimized code. Add a brief comment at the top explaining what changed.`,
	json: (_language) => "",
};

export const codeActions: AiAction[] = [
	"comments",
	"format",
	"optimize",
	"json",
];

export const localActions: AiAction[] = ["json"];
