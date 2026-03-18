import { ReactElement, ReactNode, useState } from "react";

/* Styles */
import styles from "./tabs.module.css";

type TabItem = {
	value: string;
	label: string;
	content: ReactNode;
};

type TabsProps = {
	items: TabItem[];
	defaultValue?: string;
};

const Tabs = ({ items, defaultValue }: TabsProps): ReactElement => {
	const [activeTab, setActiveTab] = useState(
		defaultValue ?? items[0]?.value ?? ""
	);

	const activeContent = items.find((item) => item.value === activeTab)?.content;

	return (
		<div className={styles.tabsContainer}>
			<div className={styles.tabList}>
				{items.map((item) => (
					<button
						key={item.value}
						type="button"
						className={`${styles.tabTrigger} ${activeTab === item.value ? styles.tabTriggerActive : ""}`}
						onClick={() => setActiveTab(item.value)}
					>
						{item.label}
					</button>
				))}
			</div>
			<div className={styles.tabContent}>{activeContent}</div>
		</div>
	);
};

export default Tabs;
