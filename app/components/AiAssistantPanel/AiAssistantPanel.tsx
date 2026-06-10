"use client";

import { ReactElement } from "react";

/* Components */
import ChatComposer from "@/components/Chat/ChatComposer/ChatComposer";
import ChatConversation from "@/components/Chat/ChatConversation/ChatConversation";
import ChatEmptyState from "@/components/Chat/ChatEmptyState/ChatEmptyState";
import SnippetPicker from "@/components/Chat/SnippetPicker/SnippetPicker";
import useAiChat from "@/lib/hooks/useAiChat";
import Plus from "@/components/ui/icons/Plus";
import Sparkle from "@/components/ui/icons/Sparkle";

/* Lib */
import { ToastType } from "@/lib/constants/toast";
import useToastStore from "@/lib/store/toast.store";

/* Utils */
import { extractCodeBlockBody } from "@/utils/chat.utils";

/* Styles */
import styles from "./aiAssistantPanel.module.css";

type AiAssistantPanelProps = {
	currentSnippet: CurrentSnippet | null;
	allSnippets: Snippet[];
	height?: string | number;
	className?: string;
	onCopyToSnippet?: (content: string) => void;
	onReplaceSnippet?: (content: string) => void;
	onSelectSnippet?: (snippetId: UUID | null) => void;
	onNewSnippet?: () => void;
};

const AiAssistantPanel = ({
	currentSnippet,
	allSnippets,
	height,
	className = "",
	onCopyToSnippet,
	onReplaceSnippet,
	onSelectSnippet,
	onNewSnippet,
}: AiAssistantPanelProps): ReactElement => {
	const { addToast } = useToastStore();

	const {
		chatRef,
		currentTurnReplaceCandidate,
		currentUserMessage,
		errorMessage,
		handleChipClick,
		handleInputChange,
		handleInputSelect,
		handleKeyDown,
		handleNewChat,
		handleSend,
		handleStop,
		handleWikiDismiss,
		handleWikiSelect,
		hasCurrentTurn,
		history,
		inputValue,
		isAnswered,
		isProcessing,
		isStopped,
		isStreaming,
		lastUsage,
		revealedAnswer,
		selectedModel,
		sendDisabled,
		showApplyButton,
		showEmptyState,
		showThinking,
		showTurnActions,
		textareaRef,
		thinkingText,
		unresolvedWikiTokens,
		wikiContext,
	} = useAiChat({
		allSnippets,
		currentSnippet,
		missingSnippetMessage: "Select a snippet first",
	});

	const handleCopyToSnippet = (content: string): void => {
		if (onCopyToSnippet) {
			onCopyToSnippet(content);
			addToast({ type: ToastType.Success, message: "Copied to snippet" });

			return;
		}

		void navigator.clipboard.writeText(content).then(() => {
			addToast({ type: ToastType.Success, message: "Copied to clipboard" });
		});
	};

	const handleReplaceSnippet = (content: string): void => {
		const body = extractCodeBlockBody(content) ?? content;

		onReplaceSnippet?.(body);
		addToast({ type: ToastType.Success, message: "Snippet replaced" });
	};

	const handleApply = (): void => {
		if (!revealedAnswer) {
			return;
		}

		onReplaceSnippet?.(revealedAnswer);
		addToast({ type: ToastType.Success, message: "AI result applied" });
	};

	const inputPlaceholder = currentSnippet
		? history.length > 0 || currentUserMessage
			? "Ask a follow-up… ([[ to link a snippet)"
			: "Ask something… ([[ to link a snippet)"
		: "Select a snippet to start a chat";

	return (
		<section
			className={`${styles.panel} ${className}`}
			style={height ? { height } : undefined}
			aria-label="AI Assistant"
		>
			<div className={styles.header}>
				<span className={styles.titleIcon}>
					<Sparkle width={16} height={16} />
				</span>

				{onSelectSnippet ? (
					<SnippetPicker
						snippets={allSnippets}
						activeSnippetId={currentSnippet?.snippet_id ?? null}
						onSelect={onSelectSnippet}
						onNew={onNewSnippet}
					/>
				) : (
					<h2 className={styles.title}>AI Assistant</h2>
				)}

				<button
					type="button"
					className={styles.iconButton}
					onClick={handleNewChat}
					title="New chat"
					aria-label="New chat"
				>
					<Plus width={15} height={15} />
				</button>
			</div>

			<div className={styles.chat} ref={chatRef}>
				{showEmptyState && (
					<ChatEmptyState
						onChipClick={handleChipClick}
						selectedModel={selectedModel}
					/>
				)}

				<ChatConversation
					currentTurnReplaceCandidate={currentTurnReplaceCandidate}
					currentUserMessage={currentUserMessage}
					errorMessage={errorMessage}
					hasCurrentTurn={hasCurrentTurn}
					history={history}
					isAnswered={isAnswered}
					isStopped={isStopped}
					isStreaming={isStreaming}
					onApply={handleApply}
					onCopyToSnippet={handleCopyToSnippet}
					onReplaceSnippet={handleReplaceSnippet}
					revealedAnswer={revealedAnswer}
					selectedModel={selectedModel}
					showApplyButton={showApplyButton}
					showThinking={showThinking}
					showTurnActions={showTurnActions}
					thinkingText={thinkingText}
				/>
			</div>

			<ChatComposer
				inputDisabled={isProcessing || !currentSnippet}
				inputValue={inputValue}
				isProcessing={isProcessing}
				lastUsage={lastUsage}
				onInputChange={handleInputChange}
				onInputSelect={handleInputSelect}
				onKeyDown={handleKeyDown}
				onSend={handleSend}
				onStop={handleStop}
				onWikiDismiss={handleWikiDismiss}
				onWikiSelect={handleWikiSelect}
				placeholder={inputPlaceholder}
				sendDisabled={sendDisabled}
				showModelSelector
				snippets={allSnippets}
				textareaRef={textareaRef}
				unresolvedWikiTokens={unresolvedWikiTokens}
				wikiContext={wikiContext}
			/>
		</section>
	);
};

export default AiAssistantPanel;
