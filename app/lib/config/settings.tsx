import { SettingsSection } from "@/lib/constants/settings.constants";

import Database from "@/components/ui/icons/Database";
import Settings from "@/components/ui/icons/Settings";
import Sparkle from "@/components/ui/icons/Sparkle";
import User from "@/components/ui/icons/User";

const IconSize = 18;

// Ordered settings sections. Add an entry to add a sidebar item.
export const settingsSections: SettingsSectionConfig[] = [
	{
		adminOnly: false,
		icon: <User width={IconSize} height={IconSize} />,
		key: SettingsSection.Profile,
		label: "Profile",
	},
	{
		adminOnly: false,
		icon: <Settings width={IconSize} height={IconSize} />,
		key: SettingsSection.Preferences,
		label: "Preferences",
	},
	{
		adminOnly: false,
		icon: <Sparkle width={IconSize} height={IconSize} />,
		key: SettingsSection.Ai,
		label: "AI",
	},
	{
		adminOnly: true,
		icon: <Database width={IconSize} height={IconSize} />,
		key: SettingsSection.Database,
		label: "Database",
	},
];
