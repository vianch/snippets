"use client";

import { ReactElement } from "react";

/* Components */
import Sparkle from "@/components/ui/icons/Sparkle";
import Copy from "@/components/ui/icons/Copy";

/* Styles */
import styles from "./assistantMessage.module.css";

type AssistantMessageProps = {
	content: string;
	modelName: string;
	isReplaceCandidate?: boolean;
	showActions?: boolean;
	onCopyToSnippet?: (content: string) => void;
	onReplaceSnippet?: (content: string) => void;
};

const AssistantMessage = ({
	content,
	modelName,
	isReplaceCandidate = false,
	showActions = true,
	onCopyToSnippet,
	onReplaceSnippet,
}: AssistantMessageProps): ReactElement => {
	const showCopy = showActions && typeof onCopyToSnippet === "function";
	const showReplace =
		showActions && isReplaceCandidate && typeof onReplaceSnippet === "function";

	return (
		<div className={styles.assistantTurn}>
			<div className={styles.assistantHeader}>
				<span className={styles.assistantHeaderIcon}>
					<Sparkle width={14} height={14} />
				</span>
				<span>{modelName || "AI"}</span>
			</div>
			<div className={styles.assistantBody}>{content}</div>
			{(showCopy || showReplace) && (
				<div className={styles.actions}>
					{showCopy && (
						<button
							type="button"
							className={styles.actionButton}
							onClick={() => onCopyToSnippet?.(content)}
						>
							<Copy width={12} height={12} />
							<span>Copy to snippet</span>
						</button>
					)}
					{showReplace && (
						<button
							type="button"
							className={`${styles.actionButton} ${styles.actionButtonSuccess}`}
							onClick={() => onReplaceSnippet?.(content)}
						>
							<svg
								width="12"
								height="12"
								viewBox="0 0 14 14"
								fill="none"
								aria-hidden="true"
							>
								<path
									d="M2.5 4 H9.5 M9.5 4 L7.5 2 M9.5 4 L7.5 6 M11.5 10 H4.5 M4.5 10 L6.5 8 M4.5 10 L6.5 12"
									stroke="currentColor"
									strokeWidth="1.4"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
							<span>Replace snippet</span>
						</button>
					)}
				</div>
			)}
		</div>
	);
};

export default AssistantMessage;
