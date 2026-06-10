import { create } from "zustand";

type State = {
	snippetListOpen: boolean;
	mainMenuOpen: boolean;
	commandPaletteOpen: boolean;
};

type Actions = {
	toggleSnippetList: () => void;
	toggleMainMenu: () => void;
	toggleCommandPalette: () => void;
	closeSnippetList: () => void;
	closeMainMenu: () => void;
	setCommandPaletteOpen: (open: boolean) => void;
};

const useMenuStore = create<State & Actions>((set) => ({
	snippetListOpen: false,
	mainMenuOpen: false,
	commandPaletteOpen: false,
	toggleSnippetList: () =>
		set((state) => ({ snippetListOpen: !state.snippetListOpen })),
	toggleMainMenu: () => set((state) => ({ mainMenuOpen: !state.mainMenuOpen })),
	toggleCommandPalette: () =>
		set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),
	closeSnippetList: () => set({ snippetListOpen: false }),
	closeMainMenu: () => set({ mainMenuOpen: false }),
	setCommandPaletteOpen: (open: boolean) => set({ commandPaletteOpen: open }),
}));

export default useMenuStore;
