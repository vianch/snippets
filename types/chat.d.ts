import { UserRole } from "@/lib/constants/ai";

declare global {
	type ChatRole = UserRole.User | UserRole.Assistant;

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

	type AssistantProseSegment = {
		content: string;
		type: "prose";
	};

	type AssistantCodeSegment = {
		body: string;
		language: string;
		type: "code";
	};

	type AssistantSegment = AssistantCodeSegment | AssistantProseSegment;
}
