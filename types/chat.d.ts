import { AiStreamEventType, UserRole } from "@/lib/constants/ai";

declare global {
	type ChatRole = UserRole.User | UserRole.Assistant;

	type ChatEntry = {
		role: ChatRole;
		content: string;
		userPrompt?: string;
		thinking?: string;
		isReplaceCandidate?: boolean;
	};

	type AiStreamThinkingEvent = {
		type: AiStreamEventType.Thinking;
		delta: string;
	};

	type AiStreamTextEvent = {
		type: AiStreamEventType.Text;
		delta: string;
	};

	type AiStreamDoneEvent = {
		type: AiStreamEventType.Done;
		result: string;
		thinking?: string;
		provider: AiProvider;
		model: string;
		usage?: AiUsage;
	};

	type AiStreamErrorEvent = {
		type: AiStreamEventType.Error;
		error: string;
	};

	type AiStreamEvent =
		| AiStreamThinkingEvent
		| AiStreamTextEvent
		| AiStreamDoneEvent
		| AiStreamErrorEvent;

	type AiStreamEmit = (event: AiStreamEvent) => void;

	type UseAiChatOptions = {
		allSnippets: Snippet[];
		currentSnippet: CurrentSnippet | null;
		missingSnippetMessage: string;
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
