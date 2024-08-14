import { create } from "zustand";

type State = {
	isMobile: boolean;
};

type Actions = {
	setIsMobile: (value: boolean) => void;
};

const useViewPortStore = create<State & Actions>((set) => ({
	isMobile: false,
	setIsMobile: (value) => set({ isMobile: value }),
}));

export default useViewPortStore;
