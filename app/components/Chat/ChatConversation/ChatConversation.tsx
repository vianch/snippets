"use client";

import { ReactElement } from "react";

/* Components */
import AssistantMessage from "@/components/Chat/AssistantMessage/AssistantMessage";
import ThinkingDisclosure from "@/components/Chat/ThinkingDisclosure/ThinkingDisclosure";
import Sparkle from "@/components/ui/icons/Sparkle";

/* Lib */
import { UserRole } from "@/lib/constants/ai";

/* Styles */
import styles from "./chatConversation.module.css";

type ChatConversationProps = {
	currentTurnReplaceCandidate: boolean;
	currentUserMessage: string;
	errorMessage: string;
	hasCurrentTurn: boolean;
	history: ChatEntry[];
	isAnswered: boolean;
	isStopped: boolean;
	isStreaming: boolean;
	onApply: () => void;
	onCopyToSnippet: (content: string) => void;
	onReplaceSnippet: (content: string) => void;
	revealedAnswer: string;
	selectedModel: string;
	showApplyButton: boolean;
	showThinking: boolean;
	showTurnActions: boolean;
	thinkingText: string;
};

const ChatConversation = ({
	currentTurnReplaceCandidate,
	currentUserMessage,
	errorMessage,
	hasCurrentTurn,
	history,
	isAnswered,
	isStopped,
	isStreaming,
	onApply,
	onCopyToSnippet,
	onReplaceSnippet,
	revealedAnswer,
	selectedModel,
	showApplyButton,
	showThinking,
	showTurnActions,
	thinkingText,
}: ChatConversationProps): ReactElement => (
	<>
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
					thinking={entry.thinking}
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

					{(showThinking || thinkingText.length > 0) && (
						<ThinkingDisclosure isActive={showThinking} text={thinkingText} />
					)}

					{isAnswered && revealedAnswer.length > 0 ? (
						<AssistantMessage
							content={revealedAnswer}
							modelName={selectedModel}
							showHeader={false}
							showActions={false}
							onReplaceSnippet={onReplaceSnippet}
						/>
					) : (
						(isStreaming || isStopped) &&
						revealedAnswer.length > 0 && (
							<div className={styles.assistantBody}>
								{revealedAnswer}
								{isStreaming && <span className={styles.caret} />}
							</div>
						)
					)}

					{isStopped && (
						<div className={styles.stoppedNote}>
							<span className={styles.stoppedDot} />
							<span>Stopped</span>
						</div>
					)}

					{errorMessage && (
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

					{showTurnActions && (
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

export default ChatConversation;
