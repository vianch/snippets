import { ReactElement, ReactNode, useState } from "react";

/* Styles */
import styles from "./tabs.module.css";

type TabItem = {
	content: ReactNode;
	icon?: ReactNode;
	label: string;
	value: string;
};

type TabsProps = {
	defaultValue?: string;
	items: TabItem[];
};

const Tabs = ({ items, defaultValue }: TabsProps): ReactElement => {
	const [activeTab, setActiveTab] = useState(
		defaultValue ?? items[0]?.value ?? ""
	);

	const foundIndex = items.findIndex((item) => item.value === activeTab);
	const activeIndex = foundIndex >= 0 ? foundIndex : 0;
	const activeContent = items[activeIndex]?.content;

	return (
		<div className={styles.tabsContainer}>
			<div className={styles.tabList} role="tablist">
				<span
					className={styles.tabIndicator}
					aria-hidden="true"
					style={{
						transform: `translateX(${activeIndex * 100}%)`,
						width: `calc((100% - 0.5rem) / ${items.length})`,
					}}
				/>
				{items.map((item) => (
					<button
						key={item.value}
						type="button"
						role="tab"
						aria-selected={activeTab === item.value}
						className={`${styles.tabTrigger} ${activeTab === item.value ? styles.tabTriggerActive : ""}`}
						onClick={() => setActiveTab(item.value)}
					>
						{item.icon && (
							<span className={styles.tabIcon} aria-hidden="true">
								{item.icon}
							</span>
						)}
						{item.label}
					</button>
				))}
			</div>
			<div key={activeTab} className={styles.tabContent} role="tabpanel">
				{activeContent}
			</div>
		</div>
	);
};

export default Tabs;
