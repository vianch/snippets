import { ToastPositions, ToastType } from "@/lib/constants/toast";

declare global {
	type Toast = {
		id?: string;
		type: ToastType;
		title?: string;
		message: string;
	};

	type ToastState = {
		toasts: Toast[] | null;
		position: ToastPositions;
	};

	type ToastActions = {
		addToast: (toast: Toast) => void;
		closeSingleToast: (id: string) => void;
		setToastPosition: (position: ToastPositions) => void;
	};
}
