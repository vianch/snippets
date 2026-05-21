import { create } from "zustand";

type ChatState = {
	selectedModel: string;
	history: ChatEntry[];
	setSelectedModel: (model: string) => void;
	appendMessage: (entry: ChatEntry) => void;
	clearHistory: () => void;
};

const useChatStore = create<ChatState>((set) => ({
	selectedModel: "",
	history: [],
	setSelectedModel: (selectedModel) => set({ selectedModel }),
	appendMessage: (entry) =>
		set((state) => ({ history: [...state.history, entry] })),
	clearHistory: () => set({ history: [] }),
}));

export default useChatStore;
