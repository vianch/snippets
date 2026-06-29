// Settings modal sections. Driven by config so adding a section is a one-line
// change (see lib/config/settings.tsx). The modal deep-links via the URL hash
// `#settings/<section>`.

export const enum SettingsSection {
	Ai = "ai",
	Database = "database",
	Preferences = "preferences",
	Profile = "profile",
}

export const DefaultSettingsSection = SettingsSection.Profile;

export const SettingsHashPrefix = "settings";

export const SettingsSectionValues = [
	SettingsSection.Ai,
	SettingsSection.Database,
	SettingsSection.Preferences,
	SettingsSection.Profile,
] as const;
