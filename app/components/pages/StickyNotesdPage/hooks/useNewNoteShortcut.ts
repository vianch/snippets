"use client";

import { useEffect, useState } from "react";

/* Constants */
import {
	DefaultNewNoteShortcutLabel,
	MacNewNoteShortcutLabel,
	NewNoteShortcutCode,
} from "@/lib/constants/notes";

const useNewNoteShortcut = (onNewNote: () => void): string => {
	const [isMac, setIsMac] = useState<boolean>(true);

	useEffect(() => {
		setIsMac(window.navigator.userAgent.includes("Mac"));
	}, []);

	useEffect(() => {
		const createNoteOnShortcut = (event: KeyboardEvent): void => {
			const isPlatformModifierPressed = isMac
				? event.metaKey && !event.ctrlKey
				: event.ctrlKey && !event.metaKey;
			const isNewNoteShortcut =
				isPlatformModifierPressed && event.code === NewNoteShortcutCode;

			if (!isNewNoteShortcut) {
				return;
			}

			event.preventDefault();

			if (!event.repeat) {
				onNewNote();
			}
		};

		document.addEventListener("keydown", createNoteOnShortcut, true);

		return () =>
			document.removeEventListener("keydown", createNoteOnShortcut, true);
	}, [isMac, onNewNote]);

	return isMac ? MacNewNoteShortcutLabel : DefaultNewNoteShortcutLabel;
};

export default useNewNoteShortcut;
