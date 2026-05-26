import { create } from "zustand";

type ChatState = {
	selectedModel: string;
	history: ChatEntry[];
	lastUsage: AiUsage | null;
	setSelectedModel: (model: string) => void;
	appendMessage: (entry: ChatEntry) => void;
	clearHistory: () => void;
	setLastUsage: (usage: AiUsage | null) => void;
};

const useChatStore = create<ChatState>((set) => ({
	selectedModel: "",
	history: [],
	lastUsage: null,
	setSelectedModel: (selectedModel) => set({ selectedModel }),
	appendMessage: (entry) =>
		set((state) => ({ history: [...state.history, entry] })),
	clearHistory: () => set({ history: [], lastUsage: null }),
	setLastUsage: (lastUsage) => set({ lastUsage }),
}));

export default useChatStore;
