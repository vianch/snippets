import {
	DefaultSettingsSection,
	SettingsHashPrefix,
	SettingsSection,
	SettingsSectionValues,
} from "@/lib/constants/settings.constants";

// Pure helpers for the `#settings/<section>` deep-link hash.

export const buildSettingsHash = (section: SettingsSection): string =>
	`${SettingsHashPrefix}/${section}`;

// Returns the section for a hash, or null when the hash isn't a settings hash
// (i.e. the modal should be closed). A bare `#settings` or an unknown section
// opens on the default section.
export const parseSettingsHash = (hash: string): SettingsSection | null => {
	const raw = hash.replace(/^#/, "");

	if (raw === SettingsHashPrefix) {
		return DefaultSettingsSection;
	}

	const prefix = `${SettingsHashPrefix}/`;

	if (!raw.startsWith(prefix)) {
		return null;
	}

	const candidate = raw.slice(prefix.length);

	if ((SettingsSectionValues as readonly string[]).includes(candidate)) {
		// validated against the known section values on the line above
		return candidate as SettingsSection;
	}

	return DefaultSettingsSection;
};
