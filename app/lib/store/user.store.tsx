import { create } from "zustand";

/* Constants */
import { defaultAvatar } from "../constants/account";

type UserState = {
	userName: string | null;
	userAvatar: string;
	email: string | null;
	isLoading: boolean;
	setUserName: (userName: string | null) => void;
	setUserAvatar: (avatar: string) => void;
	setEmail: (email: string | null) => void;
	setUserData: (userData: {
		userName?: string | null;
		userAvatar?: string;
		email?: string | null;
	}) => void;
	setLoading: (loading: boolean) => void;
	clearUser: () => void;
};

const useUserStore = create<UserState>((set) => ({
	userName: null,
	userAvatar: defaultAvatar,
	email: null,
	isLoading: true,
	setUserName: (userName) => set({ userName }),
	setUserAvatar: (userAvatar) => set({ userAvatar }),
	setEmail: (email) => set({ email }),
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
			isLoading: false,
		}),
}));

export default useUserStore;
