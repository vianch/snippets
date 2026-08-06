import { create } from "zustand";

type ChatState = {
	selectedModel: string;
	history: ChatEntry[];
	includeSnippetContext: boolean;
	lastUsage: AiUsage | null;
	setSelectedModel: (model: string) => void;
	setIncludeSnippetContext: (includeSnippetContext: boolean) => void;
	appendMessage: (entry: ChatEntry) => void;
	clearHistory: () => void;
	setLastUsage: (usage: AiUsage | null) => void;
};

const useChatStore = create<ChatState>((set) => ({
	selectedModel: "",
	history: [],
	includeSnippetContext: true,
	lastUsage: null,
	setSelectedModel: (selectedModel) => set({ selectedModel }),
	setIncludeSnippetContext: (includeSnippetContext) =>
		set({ includeSnippetContext }),
	appendMessage: (entry) =>
		set((state) => ({ history: [...state.history, entry] })),
	clearHistory: () => set({ history: [], lastUsage: null }),
	setLastUsage: (lastUsage) => set({ lastUsage }),
}));

export default useChatStore;
