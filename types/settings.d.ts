import { ReactElement } from "react";

import { SettingsSection as SettingsSectionEnum } from "@/lib/constants/settings.constants";

declare global {
	type SettingsSectionType = SettingsSectionEnum;

	// One entry in the settings sidebar. `adminOnly` sections (e.g. Database)
	// only render for admins.
	type SettingsSectionConfig = {
		adminOnly: boolean;
		icon: ReactElement;
		key: SettingsSectionType;
		label: string;
	};
}

export {};
