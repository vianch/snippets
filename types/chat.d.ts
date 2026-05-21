type ChatRole = "user" | "assistant";

type ChatEntry = {
	role: ChatRole;
	content: string;
	userPrompt?: string;
	isReplaceCandidate?: boolean;
};

type WikiLinkContext = {
	start: number;
	query: string;
};
