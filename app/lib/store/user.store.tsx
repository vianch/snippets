import { create } from "zustand";

/* Constants */
import { defaultAvatar } from "../constants/account";
import { ThemeNames } from "../config/themes";

type UserState = {
	userName: string | null;
	userAvatar: string;
	email: string | null;
	theme: string;
	aiApiKey: string;
	autoSave: boolean;
	isLoading: boolean;
	setUserName: (userName: string | null) => void;
	setUserAvatar: (avatar: string) => void;
	setEmail: (email: string | null) => void;
	setTheme: (theme: string) => void;
	setAiApiKey: (aiApiKey: string) => void;
	setAutoSave: (autoSave: boolean) => void;
	setUserData: (userData: {
		userName?: string | null;
		userAvatar?: string;
		email?: string | null;
		theme?: string;
		aiApiKey?: string;
		autoSave?: boolean;
	}) => void;
	setLoading: (loading: boolean) => void;
	clearUser: () => void;
};

const useUserStore = create<UserState>((set) => ({
	userName: null,
	userAvatar: defaultAvatar,
	email: null,
	theme: ThemeNames.Dracula,
	aiApiKey: "",
	autoSave: false,
	isLoading: true,
	setUserName: (userName) => set({ userName }),
	setUserAvatar: (userAvatar) => set({ userAvatar }),
	setEmail: (email) => set({ email }),
	setTheme: (theme) => set({ theme }),
	setAiApiKey: (aiApiKey) => set({ aiApiKey }),
	setAutoSave: (autoSave) => set({ autoSave }),
	setUserData: (userData) =>
		set((state) => ({
			...state,
			...userData,
		})),
	setLoading: (isLoading) => set({ isLoading }),
	clearUser: () =>
		set({
			userName: null,
			userAvatar: defaultAvatar,
			email: null,
			theme: ThemeNames.Dracula,
			aiApiKey: "",
			autoSave: false,
			isLoading: false,
		}),
}));

export default useUserStore;
