import { MouseEvent, MutableRefObject, useEffect } from "react";
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

		const isClickInsideEditor = elementsToAvoidClosing.some(
			(id: string) => (event.target as HTMLElement)?.id === id
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
