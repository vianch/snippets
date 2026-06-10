"use client";

import { ReactElement } from "react";

/* Components */
import Sparkle from "@/components/ui/icons/Sparkle";

/* Lib */
import { aiActionLabels, chipActions } from "@/lib/constants/ai";

/* Styles */
import styles from "./chatEmptyState.module.css";

type ChatEmptyStateProps = {
	onChipClick: (action: AiAction) => void;
	selectedModel: string;
};

const ChatEmptyState = ({
	onChipClick,
	selectedModel,
}: ChatEmptyStateProps): ReactElement => (
	<div className={styles.empty}>
		<span className={styles.emptyIcon}>
			<Sparkle width={36} height={36} />
		</span>
		<h3 className={styles.emptyHeading}>What can I help you with?</h3>
		<p className={styles.emptySubtext}>
			Ask about the snippet on screen — explain it, refactor it, add comments,
			or anything else.
		</p>
		<p className={styles.emptyModel}>
			Model:{" "}
			<span className={styles.emptyModelName}>
				{selectedModel || "default"}
			</span>
		</p>
		<div className={styles.chips}>
			{chipActions.map((action) => (
				<button
					key={action}
					type="button"
					className={styles.chip}
					onClick={() => onChipClick(action)}
				>
					{aiActionLabels[action]}
				</button>
			))}
		</div>
	</div>
);

export default ChatEmptyState;
