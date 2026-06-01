import { ReactElement } from "react";

import shortcutGroups, { ModKey, ModKeyLabel } from "@/lib/constants/shortcuts";

import styles from "./shortcutsShowcase.module.css";

const ShortcutsShowcase = (): ReactElement => {
	return (
		<div className={styles.groups}>
			{shortcutGroups.map((group) => (
				<div className={styles.group} key={group.heading}>
					<h3 className={styles.heading}>{group.heading}</h3>

					<ul className={styles.list}>
						{group.items.map((item) => (
							<li className={styles.row} key={item.description}>
								<span className={styles.keys}>
									{item.keys.map((key, keyIndex) => (
										<kbd className={styles.kbd} key={keyIndex}>
											{key === ModKey ? ModKeyLabel : key}
										</kbd>
									))}
								</span>

								<span className={styles.description}>{item.description}</span>
							</li>
						))}
					</ul>
				</div>
			))}
		</div>
	);
};

export default ShortcutsShowcase;
