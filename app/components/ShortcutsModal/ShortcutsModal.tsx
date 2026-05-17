"use client";

import { ReactElement, useEffect, useState } from "react";

/* Components */
import Modal from "@/components/ui/Modal/Modal";

/* Constants */
import shortcutGroups from "@/lib/constants/shortcuts";

/* Styles */
import styles from "./shortcutsModal.module.css";

type ShortcutsModalProps = {
	isOpen: boolean;
	onClose: () => void;
};

const ShortcutsModal = ({
	isOpen,
	onClose,
}: ShortcutsModalProps): ReactElement => {
	const [modKey, setModKey] = useState<string>("Ctrl");

	useEffect(() => {
		if (typeof navigator !== "undefined") {
			setModKey(navigator.userAgent.includes("Mac") ? "⌘" : "Ctrl");
		}
	}, []);

	const renderKey = (key: string): string => (key === "Mod" ? modKey : key);

	return (
		<Modal isOpen={isOpen} onClose={onClose} title="Keyboard shortcuts">
			<div className={styles.groups}>
				{shortcutGroups.map((group) => (
					<section key={group.heading} className={styles.group}>
						<h3 className={styles.groupHeading}>{group.heading}</h3>
						<ul className={styles.list}>
							{group.items.map((item, index) => (
								<li key={`${group.heading}-${index}`} className={styles.row}>
									<span className={styles.description}>{item.description}</span>
									<span className={styles.keys}>
										{item.keys.map((key, keyIndex) => (
											<kbd
												key={`${group.heading}-${index}-${keyIndex}`}
												className={styles.kbd}
											>
												{renderKey(key)}
											</kbd>
										))}
									</span>
								</li>
							))}
						</ul>
					</section>
				))}
			</div>
		</Modal>
	);
};

export default ShortcutsModal;
