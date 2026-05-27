import { create } from "zustand";

/* Constants */
import { ToastPositions, ToastTimeOut } from "@/lib/constants/toast";

/* Utils */
import uuidv4 from "@/utils/string.utils";

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const useToastStore = create<ToastState & ToastActions>((set) => ({
	toasts: null,
	position: ToastPositions.BottomRight,
	addToast: (toast: Toast) => {
		const newToast = {
			...toast,
			id: toast.id || uuidv4(),
		};

		set((state) => ({
			toasts: state.toasts ? [...state.toasts, newToast] : [newToast],
		}));

		const timeoutId = setTimeout(() => {
			toastTimeouts.delete(newToast.id);
			useToastStore.getState().closeSingleToast(newToast.id);
		}, ToastTimeOut);

		toastTimeouts.set(newToast.id, timeoutId);
	},
	closeSingleToast: (id: string) => {
		const timeoutId = toastTimeouts.get(id);

		if (timeoutId !== undefined) {
			clearTimeout(timeoutId);
			toastTimeouts.delete(id);
		}

		set((state) => ({
			toasts: state.toasts
				? state.toasts.filter((toast) => toast.id !== id)
				: null,
		}));
	},
	setToastPosition: (position: ToastPositions) => set({ position }),
}));

export default useToastStore;
