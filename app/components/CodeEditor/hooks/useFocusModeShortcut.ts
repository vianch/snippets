"use client";

import { useEffect } from "react";

type UseFocusModeShortcutParams = {
	canToggleFocusMode: boolean;
	isFocusMode: boolean;
	onExit: () => void;
	onToggle: () => void;
};

const useFocusModeShortcut = ({
	canToggleFocusMode,
	isFocusMode,
	onExit,
	onToggle,
}: UseFocusModeShortcutParams): void => {
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent): void => {
			const isModifierPressed = event.ctrlKey || event.metaKey;
			const isToggleShortcut =
				isModifierPressed && event.shiftKey && event.key.toLowerCase() === "f";

			if (isToggleShortcut) {
				if (!canToggleFocusMode) {
					return;
				}

				event.preventDefault();
				onToggle();

				return;
			}

			if (event.key === "Escape" && isFocusMode) {
				event.preventDefault();
				event.stopPropagation();
				onExit();
			}
		};

		// Capture phase: focus-mode exit must win over other Esc listeners
		// (modals, suggestion popovers) that are also bound while it is open.
		window.addEventListener("keydown", handleKeyDown, true);

		return () => {
			window.removeEventListener("keydown", handleKeyDown, true);
		};
	}, [canToggleFocusMode, isFocusMode, onExit, onToggle]);
};

export default useFocusModeShortcut;
