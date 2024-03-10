import { create } from "zustand";

type State = {
	snippetListOpen: boolean;
	mainMenuOpen: boolean;
};

type Actions = {
	toggleSnippetList: () => void;
	toggleMainMenu: () => void;
	closeSnippetList: () => void;
	closeMainMenu: () => void;
};

const useMenuStore = create<State & Actions>((set) => ({
	snippetListOpen: false,
	mainMenuOpen: false,
	toggleSnippetList: () =>
		set((state) => ({ snippetListOpen: !state.snippetListOpen })),
	toggleMainMenu: () => set((state) => ({ mainMenuOpen: !state.mainMenuOpen })),
	closeSnippetList: () => set({ snippetListOpen: false }),
	closeMainMenu: () => set({ mainMenuOpen: false }),
}));

export default useMenuStore;
