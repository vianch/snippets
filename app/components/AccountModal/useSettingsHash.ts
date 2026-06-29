"use client";

import { useEffect, useState } from "react";

import { SettingsSection } from "@/lib/constants/settings.constants";

import { buildSettingsHash, parseSettingsHash } from "@/utils/settings.utils";

// Single source of truth for whether the settings modal is open and which
// section shows. The URL hash drives everything, so deep links and the browser
// back/forward buttons work. `section === null` means the modal is closed.
export const useSettingsHash = (): {
	close: () => void;
	openSection: (next: SettingsSection) => void;
	section: SettingsSection | null;
} => {
	const [section, setSection] = useState<SettingsSection | null>(null);

	useEffect(() => {
		const sync = (): void => {
			setSection(parseSettingsHash(window.location.hash));
		};

		sync();
		window.addEventListener("hashchange", sync);
		window.addEventListener("popstate", sync);

		return () => {
			window.removeEventListener("hashchange", sync);
			window.removeEventListener("popstate", sync);
		};
	}, []);

	// Assigning the hash pushes a history entry, so back/forward step between
	// sections.
	const openSection = (next: SettingsSection): void => {
		window.location.hash = buildSettingsHash(next);
	};

	// Strip the hash entirely without adding a history entry.
	const close = (): void => {
		window.history.replaceState(
			null,
			"",
			window.location.pathname + window.location.search
		);
		setSection(null);
	};

	return { close, openSection, section };
};
