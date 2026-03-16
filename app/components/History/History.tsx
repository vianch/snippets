"use client";

import { ReactElement, useEffect, useState } from "react";

/* Lib and Utils */
import { getSnippetVersions } from "@/lib/supabase/queries";
import useViewPortStore from "@/lib/store/viewPort.store";

/* Components */
import Button from "@/components/ui/Button/Button";

/* Styles */
import styles from "./history.module.css";

type HistoryProps = {
	snippetId: UUID;
	isOpen: boolean;
	onRestore: (version: SnippetVersion) => void;
	onClose: () => void;
	undoSnapshot: CurrentSnippet | null;
	onUndo: () => void;
};

const History = ({
	snippetId,
	isOpen,
	onRestore,
	onClose,
	undoSnapshot,
	onUndo,
}: HistoryProps): ReactElement => {
	const isMobile = useViewPortStore((state) => state.isMobile);
	const [versions, setVersions] = useState<SnippetVersion[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (!isOpen || !snippetId) return;

		setIsLoading(true);

		getSnippetVersions(snippetId)
			.then((data) => setVersions(data))
			.catch(() => setVersions([]))
			.finally(() => setIsLoading(false));
	}, [isOpen, snippetId]);

	if (!isOpen) return <></>;

	return (
		<>
			{!isMobile && <div className={styles.overlay} onClick={onClose} />}
			<div className={isMobile ? styles.panelMobile : styles.panel}>
				<div className={styles.header}>
					<span className={styles.title}>Version History</span>
					<button
						type="button"
						className={styles.closeButton}
						onClick={onClose}
					>
						&times;
					</button>
				</div>

				<div className={styles.content}>
					{undoSnapshot && (
						<div className={styles.undoBar}>
							<Button variant="tertiary" onClick={onUndo}>
								Undo last restore
							</Button>
						</div>
					)}

					{isLoading && (
						<p className={styles.emptyState}>Loading history...</p>
					)}

					{!isLoading && versions.length === 0 && (
						<p className={styles.emptyState}>No history yet</p>
					)}

					{!isLoading && versions.length > 0 && (
						<ul className={styles.list}>
							{versions.map((version) => (
								<li key={version.version_id} className={styles.listItem}>
									<div className={styles.versionMeta}>
										<span className={styles.versionNumber}>
											v{version.version_number}
										</span>
										<span className={styles.versionName}>{version.name}</span>
										<span className={styles.versionLanguage}>
											{version.language}
										</span>
									</div>

									<Button
										variant="secondary"
										className={styles.restoreButton}
										onClick={() => onRestore(version)}
									>
										Restore
									</Button>
								</li>
							))}
						</ul>
					)}
				</div>
			</div>
		</>
	);
};

export default History;
