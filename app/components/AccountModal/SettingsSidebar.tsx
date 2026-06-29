import { ReactElement } from "react";

import { SettingsSection } from "@/lib/constants/settings.constants";

import styles from "./accountModal.module.css";

interface SettingsSidebarProps {
	activeSection: SettingsSection;
	onSelect: (section: SettingsSection) => void;
	sections: SettingsSectionConfig[];
}

const SettingsSidebar = ({
	activeSection,
	onSelect,
	sections,
}: SettingsSidebarProps): ReactElement => {
	return (
		<nav className={styles.sidebar} aria-label="Settings sections">
			{sections.map((item) => (
				<button
					key={item.key}
					type="button"
					aria-current={activeSection === item.key}
					className={`${styles.sidebarItem} ${
						activeSection === item.key ? styles.sidebarItemActive : ""
					}`}
					onClick={() => onSelect(item.key)}
				>
					<span className={styles.sidebarItemIcon} aria-hidden="true">
						{item.icon}
					</span>
					{item.label}
				</button>
			))}
		</nav>
	);
};

export default SettingsSidebar;
