import { create } from "zustand";

/* Constants */
import { ToastPositions, ToastTimeOut, ToastType } from "@/lib/constants/toast";

/* Logger */
import { logger } from "@/lib/logger/logger";

/* Store */
import usePetStore, { emitPetMessage } from "@/lib/store/pet.store";

/* Utils */
import uuidv4 from "@/utils/string.utils";

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const useToastStore = create<ToastState & ToastActions>((set) => ({
	toasts: null,
	position: ToastPositions.BottomCenter,
	addToast: (toast: Toast) => {
		if (toast.type === ToastType.Error) {
			logger.error(toast.message, { source: "toast" });
		}

		// When the pet is on screen it does the talking: two notifications for one
		// action is noise, and the bubble is the more charming of the two. The pet
		// is only ever active on a desktop viewport with the preference on, so
		// phones, tablets and pet-disabled sessions always get the toast strip.
		if (usePetStore.getState().petActive) {
			emitPetMessage(
				toast.title ? `${toast.title}: ${toast.message}` : toast.message,
				toast.type
			);

			return;
		}

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
