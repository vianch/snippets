import { create } from "zustand";

type State = {
	isFocusMode: boolean;
	isMobile: boolean;
};

type Actions = {
	setFocusMode: (value: boolean) => void;
	setIsMobile: (value: boolean) => void;
};

const useViewPortStore = create<State & Actions>((set) => ({
	isFocusMode: false,
	isMobile: false,
	setFocusMode: (value) => set({ isFocusMode: value }),
	setIsMobile: (value) => set({ isMobile: value }),
}));

export default useViewPortStore;
