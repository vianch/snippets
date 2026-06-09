import { ReactElement } from "react";

import {
	aiActionLabels,
	aiActions,
	ChatStatus,
	chipActions,
	UserRole,
} from "@/lib/constants/ai";
import AssistantMessage from "@/components/CodeEditor/AiChatModal/AssistantMessage/AssistantMessage";
import Sparkle from "@/components/ui/icons/Sparkle";

import styles from "../aiChatModal.module.css";

type ChatMessageListProps = {
	currentTurnReplaceCandidate: boolean;
	currentUserMessage: string;
	errorMessage: string;
	hasCurrentTurn: boolean;
	history: ChatEntry[];
	isStreaming: boolean;
	lastAction: AiAction | null;
	revealedAnswer: string;
	selectedModel: string;
	showApplyButton: boolean;
	showEmptyState: boolean;
	showThinking: boolean;
	status: ChatStatus;
	onApply: () => void;
	onChipClick: (action: AiAction) => void;
	onCopyToSnippet: (content: string) => void;
	onReplaceSnippet: (content: string) => void;
};

const ChatMessageList = ({
	currentTurnReplaceCandidate,
	currentUserMessage,
	errorMessage,
	hasCurrentTurn,
	history,
	isStreaming,
	lastAction,
	revealedAnswer,
	selectedModel,
	showApplyButton,
	showEmptyState,
	showThinking,
	status,
	onApply,
	onChipClick,
	onCopyToSnippet,
	onReplaceSnippet,
}: ChatMessageListProps): ReactElement => (
	<>
		{showEmptyState && (
			<div className={styles.empty}>
				<span className={styles.emptyIcon}>
					<Sparkle width={36} height={36} />
				</span>
				<h3 className={styles.emptyHeading}>What can I help you with?</h3>
				<p className={styles.emptySubtext}>
					Ask about the snippet on screen — explain it, refactor it, add
					comments, or anything else.
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
		)}

		{history.map((entry, index) =>
			entry.role === UserRole.User ? (
				<div key={index} className={styles.userTurn}>
					{entry.content}
				</div>
			) : (
				<AssistantMessage
					key={index}
					content={entry.content}
					modelName={selectedModel}
					onCopyToSnippet={onCopyToSnippet}
					onReplaceSnippet={onReplaceSnippet}
				/>
			)
		)}

		{hasCurrentTurn && (
			<>
				{currentUserMessage && (
					<div className={styles.userTurn}>{currentUserMessage}</div>
				)}

				<div className={styles.assistantTurn}>
					<div className={styles.assistantHeader}>
						<span className={styles.assistantHeaderIcon}>
							<Sparkle width={14} height={14} />
						</span>
						<span>{selectedModel || "AI"}</span>
					</div>

					{showThinking && (
						<div className={styles.loader}>
							<span className={styles.loaderSparkle}>
								<Sparkle width={16} height={16} />
							</span>
							<span className={styles.shimmerText}>Thinking…</span>
						</div>
					)}

					{status === ChatStatus.Answered && revealedAnswer.length > 0 ? (
						<AssistantMessage
							content={revealedAnswer}
							modelName={selectedModel}
							showHeader={false}
							showActions={false}
							onReplaceSnippet={onReplaceSnippet}
						/>
					) : (
						(isStreaming || status === ChatStatus.Stopped) &&
						revealedAnswer.length > 0 && (
							<div className={styles.assistantBody}>
								{revealedAnswer}
								{isStreaming && <span className={styles.caret} />}
							</div>
						)
					)}

					{status === ChatStatus.Stopped && (
						<div className={styles.stoppedNote}>
							<span className={styles.stoppedDot} />
							<span>Stopped</span>
						</div>
					)}

					{status === ChatStatus.Error && errorMessage && (
						<p className={styles.errorMessage}>{errorMessage}</p>
					)}

					{showApplyButton && (
						<button
							type="button"
							className={styles.applyButton}
							onClick={onApply}
						>
							Apply to editor
						</button>
					)}

					{status === ChatStatus.Answered && lastAction === aiActions.ask && (
						<div className={styles.currentTurnActions}>
							<button
								type="button"
								className={styles.actionButton}
								onClick={() => onCopyToSnippet(revealedAnswer)}
							>
								Copy to snippet
							</button>
							{currentTurnReplaceCandidate && (
								<button
									type="button"
									className={`${styles.actionButton} ${styles.actionButtonSuccess}`}
									onClick={() => onReplaceSnippet(revealedAnswer)}
								>
									Replace snippet
								</button>
							)}
						</div>
					)}
				</div>
			</>
		)}
	</>
);

export default ChatMessageList;
