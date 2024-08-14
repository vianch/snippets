import { create } from "zustand";

/* Constants */
import { ToastPositions, ToastTimeOut } from "@/lib/constants/toast";

/* Utils */
import uuidv4 from "@/utils/string.utilts";

const useToastStore = create<ToastState & ToastActions>((set) => ({
	toasts: null,
	position: ToastPositions.BottomRight,
	addToast: (toast: Toast) => {
		const newToast = {
			...toast,
			id: toast.id || uuidv4(), // Use existing id or generate a new one
		};

		set((state) => ({
			toasts: state.toasts ? [...state.toasts, newToast] : [newToast],
		}));

		// Automatically close the toast after 3000ms
		setTimeout(() => {
			useToastStore.getState().closeSingleToast(newToast.id);
		}, ToastTimeOut);
	},
	closeSingleToast: (id: string) =>
		set((state) => ({
			toasts: state.toasts
				? state.toasts.filter((toast) => toast.id !== id)
				: null,
		})),
	setToastPosition: (position: ToastPositions) => set({ position }),
}));

export default useToastStore;
