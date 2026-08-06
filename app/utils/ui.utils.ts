import {
	MouseEvent,
	MutableRefObject,
	RefObject,
	useEffect,
	useRef,
} from "react";
import useViewPortStore from "@/lib/store/viewPort.store";
import useMenuStore from "@/lib/store/menu.store";

export const isClient = (): boolean => {
	return typeof window !== "undefined";
};

export const useDeviceViewPort = (): void => {
	const setIsMobile = useViewPortStore((state) => state.setIsMobile);

	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth < 1140); // Adjust the width threshold as needed
		};

		window.addEventListener("resize", handleResize);
		handleResize(); // Initial check

		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, [setIsMobile]);
};

export const useClickOutside = (
	reference: RefObject<HTMLElement | null>,
	onClickOutside: () => void,
	enabled: boolean = true
): void => {
	useEffect(() => {
		if (!enabled) return;

		const handleClickOutside = (event: globalThis.MouseEvent): void => {
			if (
				reference.current &&
				!reference.current.contains(event.target as Node)
			) {
				onClickOutside();
			}
		};

		document.addEventListener("mousedown", handleClickOutside);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [reference, onClickOutside, enabled]);
};

// Overlays either measure their anchor once (Menu, SnippetDetails) or assume a
// layout that a resize invalidates, so a resize while one is open leaves it
// detached from whatever opened it. Closing is the honest outcome.
export const useCloseOnResize = (
	onClose: () => void,
	enabled: boolean = true
): void => {
	const widthRef = useRef<number>(0);

	useEffect(() => {
		if (!enabled) {
			return;
		}

		widthRef.current = window.innerWidth;

		const handleResize = (): void => {
			const isWidthUnchanged = widthRef.current === window.innerWidth;
			const activeElement = document.activeElement;
			const isEditing =
				activeElement instanceof HTMLElement &&
				(activeElement.isContentEditable ||
					activeElement instanceof HTMLInputElement ||
					activeElement instanceof HTMLTextAreaElement);

			widthRef.current = window.innerWidth;

			// The mobile on-screen keyboard resizes height only. Ignoring that one
			// case keeps the overlay from closing itself the moment a field is
			// focused — every other resize still closes it.
			if (isWidthUnchanged && isEditing) {
				return;
			}

			onClose();
		};

		window.addEventListener("resize", handleResize);

		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, [enabled, onClose]);
};

export const useCloseOutsideCodeEditor = (
	reference: MutableRefObject<HTMLDivElement | null>
): void => {
	const closeSnippetList = useMenuStore((state) => state.closeSnippetList);
	const closeMainMenu = useMenuStore((state) => state.closeMainMenu);
	const elementsToAvoidClosing = [
		"snippet-list-aside",
		"snippet-list-items",
		"snippet-list-header",
		"aside-menu",
	];
	const handleClickOutside = (event: MouseEvent) => {
		const isIconInMenuMainMenu = (event.target as HTMLElement)?.closest(
			"#mobile-icon-main-menu"
		);
		const isIconInMenuOpenList = (event.target as HTMLElement)?.closest(
			"#mobile-icon-open-list"
		);

		const isClickInsideEditor = elementsToAvoidClosing.some((id: string) =>
			(event.target as HTMLElement)?.closest(`#${id}`)
		);

		if (
			reference.current &&
			!isIconInMenuMainMenu &&
			!isIconInMenuOpenList &&
			!isClickInsideEditor
		) {
			closeSnippetList();
			closeMainMenu();
		}
	};

	useEffect(() => {
		document.addEventListener(
			"mousedown",
			handleClickOutside as unknown as EventListener
		);

		return () => {
			document.removeEventListener(
				"mousedown",
				handleClickOutside as unknown as EventListener
			);
		};
	}, [reference, closeSnippetList, closeMainMenu]);
};
