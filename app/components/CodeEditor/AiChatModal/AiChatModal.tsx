"use client";

import {
	CSSProperties,
	PointerEvent,
	ReactElement,
	useEffect,
	useState,
} from "react";
import { createPortal } from "react-dom";

/* Components */
import ChatComposer from "@/components/Chat/ChatComposer/ChatComposer";
import ChatConversation from "@/components/Chat/ChatConversation/ChatConversation";
import ChatEmptyState from "@/components/Chat/ChatEmptyState/ChatEmptyState";
import useAiChat from "@/lib/hooks/useAiChat";
import Sparkle from "@/components/ui/icons/Sparkle";

/* Lib */
import {
	aiChatModalMinWidthPx,
	aiChatModalWidthStorageKey,
} from "@/lib/constants/ai";
import { ToastType } from "@/lib/constants/toast";
import useToastStore from "@/lib/store/toast.store";
import useViewPortStore from "@/lib/store/viewPort.store";
import { getUserDataFromSession } from "@/lib/supabase/queries";

/* Utils */
import { extractCodeBlockBody } from "@/utils/chat.utils";

/* Styles */
import styles from "./aiChatModal.module.css";

type AiChatModalProps = {
	isOpen: boolean;
	currentSnippet: CurrentSnippet;
	allSnippets?: Snippet[];
	onClose: () => void;
	onApplyCode: (code: string) => void;
	onCopyToSnippet?: (content: string) => void;
	onReplaceSnippet?: (content: string) => void;
};

const AiChatModal = ({
	isOpen,
	currentSnippet,
	allSnippets = [],
	onClose,
	onApplyCode,
	onCopyToSnippet,
	onReplaceSnippet,
}: AiChatModalProps): ReactElement | null => {
	const { addToast } = useToastStore();
	const isMobile = useViewPortStore((state) => state.isMobile);

	const {
		abortInFlight,
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
		resetTurnState,
		revealedAnswer,
		selectedModel,
		sendDisabled,
		setSelectedModel,
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
		missingSnippetMessage: "No code to analyze",
	});

	const [drawerWidth, setDrawerWidth] = useState<number>(aiChatModalMinWidthPx);
	const [isResizing, setIsResizing] = useState<boolean>(false);

	useEffect(() => {
		if (!isOpen) {
			abortInFlight();

			return;
		}

		const handleEscape = (event: globalThis.KeyboardEvent): void => {
			if (event.key === "Escape") {
				onClose();
			}
		};

		document.addEventListener("keydown", handleEscape);

		return () => {
			document.removeEventListener("keydown", handleEscape);
		};
	}, [isOpen, onClose]);

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		textareaRef.current?.focus();
	}, [isOpen]);

	useEffect(() => {
		if (!isOpen) {
			resetTurnState();

			return;
		}

		if (selectedModel.length === 0) {
			getUserDataFromSession().then((session) => {
				const model = session?.user?.user_metadata?.ai_model;

				if (model) {
					setSelectedModel(model);
				}
			});
		}
	}, [isOpen, selectedModel, setSelectedModel]);

	useEffect(() => {
		if (typeof window === "undefined") {
			return;
		}

		const stored = window.localStorage.getItem(aiChatModalWidthStorageKey);

		if (stored) {
			const parsed = Number.parseInt(stored, 10);

			if (Number.isFinite(parsed) && parsed >= aiChatModalMinWidthPx) {
				setDrawerWidth(Math.min(parsed, window.innerWidth));
			}
		}
	}, []);

	const handleApply = (): void => {
		if (!revealedAnswer) {
			return;
		}

		onApplyCode(revealedAnswer);
		addToast({
			type: ToastType.Success,
			message: "AI result applied",
		});
		onClose();
	};

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

		if (onReplaceSnippet) {
			onReplaceSnippet(body);
		} else {
			onApplyCode(body);
		}

		addToast({ type: ToastType.Success, message: "Snippet replaced" });
	};

	const handleResizePointerDown = (
		event: PointerEvent<HTMLDivElement>
	): void => {
		if (isMobile) {
			return;
		}

		event.preventDefault();
		event.currentTarget.setPointerCapture(event.pointerId);
		document.body.style.cursor = "ew-resize";
		document.body.style.userSelect = "none";
		setIsResizing(true);
	};

	const handleResizePointerMove = (
		event: PointerEvent<HTMLDivElement>
	): void => {
		if (!isResizing) {
			return;
		}

		const viewportWidth = window.innerWidth;
		const computed = viewportWidth - event.clientX;
		const clamped = Math.min(
			viewportWidth,
			Math.max(aiChatModalMinWidthPx, computed)
		);

		setDrawerWidth(clamped);
	};

	const finishResize = (event: PointerEvent<HTMLDivElement>): void => {
		if (!isResizing) {
			return;
		}

		if (event.currentTarget.hasPointerCapture(event.pointerId)) {
			event.currentTarget.releasePointerCapture(event.pointerId);
		}

		document.body.style.cursor = "";
		document.body.style.userSelect = "";
		setIsResizing(false);
		window.localStorage.setItem(
			aiChatModalWidthStorageKey,
			String(Math.round(drawerWidth))
		);
	};

	if (!isOpen || typeof document === "undefined") {
		return null;
	}

	const snippetDisplayName = currentSnippet?.name?.trim() || "Untitled snippet";
	const inputPlaceholder =
		history.length > 0 || currentUserMessage
			? "Ask a follow-up… ([[ to link a snippet)"
			: "Ask something… ([[ to link a snippet)";
	const drawerStyle: CSSProperties | undefined = isMobile
		? undefined
		: { width: `${drawerWidth}px` };

	const drawerContent = (
		<aside
			className={`${styles.drawer} ${isResizing ? styles.drawerResizing : ""}`}
			style={drawerStyle}
			role="complementary"
			aria-label="Ask AI"
		>
			<div
				className={`${styles.resizeHandle} ${isResizing ? styles.resizeHandleActive : ""}`}
				role="separator"
				aria-orientation="vertical"
				aria-label="Resize chat panel"
				onPointerDown={handleResizePointerDown}
				onPointerMove={handleResizePointerMove}
				onPointerUp={finishResize}
				onPointerCancel={finishResize}
			/>

			<div className={styles.header}>
				<h2 className={styles.title}>
					<span className={styles.titleIcon}>
						<Sparkle width={16} height={16} />
					</span>
					<span>Ask AI</span>
					<span className={styles.subtitle}>· {snippetDisplayName}</span>
				</h2>

				<div className={styles.headerActions}>
					<button
						type="button"
						className={styles.iconButton}
						onClick={handleNewChat}
						title="New chat"
						aria-label="New chat"
					>
						<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
							<path
								d="M9 2 L12 5 L7.5 9.5 L4.5 9.5 L4.5 6.5 Z"
								stroke="currentColor"
								strokeWidth="1.3"
								strokeLinejoin="round"
								fill="none"
							/>
						</svg>
					</button>

					<span className={styles.kbdHint}>Esc</span>

					<button
						type="button"
						className={styles.iconButton}
						onClick={onClose}
						aria-label="Close"
					>
						<svg width="13" height="13" viewBox="0 0 14 14" fill="none">
							<path
								d="M3 3 L11 11 M11 3 L3 11"
								stroke="currentColor"
								strokeWidth="1.5"
								strokeLinecap="round"
							/>
						</svg>
					</button>
				</div>
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
				inputDisabled={isProcessing}
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
				snippets={allSnippets}
				textareaRef={textareaRef}
				unresolvedWikiTokens={unresolvedWikiTokens}
				wikiContext={wikiContext}
			/>
		</aside>
	);

	return createPortal(drawerContent, document.body);
};

export default AiChatModal;
