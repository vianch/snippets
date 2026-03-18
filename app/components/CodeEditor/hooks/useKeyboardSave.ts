"use client";

import { useEffect } from "react";

const useKeyboardSave = (onSave: () => void, isDisabled: boolean): void => {
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent): void => {
			const isModifierPressed = event.ctrlKey || event.metaKey;

			if (isModifierPressed && event.key === "s") {
				event.preventDefault();

				if (!isDisabled) {
					onSave();
				}
			}
		};

		window.addEventListener("keydown", handleKeyDown);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [onSave, isDisabled]);
};

export default useKeyboardSave;
