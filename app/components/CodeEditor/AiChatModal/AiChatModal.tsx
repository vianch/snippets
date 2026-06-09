"use client";

import {
	ChangeEvent,
	CSSProperties,
	KeyboardEvent,
	ReactElement,
	useEffect,
	useRef,
	useState,
} from "react";
import { createPortal } from "react-dom";

/* Components */
import ChatMessageList from "@/components/CodeEditor/AiChatModal/ChatMessageList/ChatMessageList";
import useResizableDrawer from "@/components/CodeEditor/AiChatModal/hooks/useResizableDrawer";
import WikiLinkPopover from "@/components/CodeEditor/AiChatModal/WikiLinkPopover/WikiLinkPopover";
import ContextUsage from "@/components/ContextUsage/ContextUsage";
import Sparkle from "@/components/ui/icons/Sparkle";

/* Lib */
import {
	aiActionLabels,
	aiActions,
	ChatStatus,
	codeActions,
	maxStreamChunk,
	minStreamChunk,
	streamStepMs,
	UserRole,
} from "@/lib/constants/ai";
import { ToastType } from "@/lib/constants/toast";
import useChatStore from "@/lib/store/chat.store";
import useToastStore from "@/lib/store/toast.store";
import useViewPortStore from "@/lib/store/viewPort.store";
import { getUserDataFromSession } from "@/lib/supabase/queries";
import { resolveWikiLinks } from "@/lib/wikiLinkResolver";

/* Utils */
import { requestAiAction } from "@/utils/ai.utils";
import {
	detectReplaceCandidate,
	extractCodeBlockBody,
	findWikiLinkContext,
} from "@/utils/chat.utils";

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
	const selectedModel = useChatStore((state) => state.selectedModel);
	const setSelectedModel = useChatStore((state) => state.setSelectedModel);
	const history = useChatStore((state) => state.history);
	const lastUsage = useChatStore((state) => state.lastUsage);
	const appendMessage = useChatStore((state) => state.appendMessage);
	const clearHistory = useChatStore((state) => state.clearHistory);
	const setLastUsage = useChatStore((state) => state.setLastUsage);

	const [status, setStatus] = useState<ChatStatus>(ChatStatus.Empty);
	const [currentUserMessage, setCurrentUserMessage] = useState<string>("");
	const [currentUserPrompt, setCurrentUserPrompt] = useState<string>("");
	const [revealedAnswer, setRevealedAnswer] = useState<string>("");
	const [errorMessage, setErrorMessage] = useState<string>("");
	const [lastAction, setLastAction] = useState<AiAction | null>(null);
	const [inputValue, setInputValue] = useState<string>("");
	const [unresolvedWikiTokens, setUnresolvedWikiTokens] = useState<string[]>(
		[]
	);
	const [wikiContext, setWikiContext] = useState<WikiLinkContext | null>(null);
	const {
		drawerWidth,
		isResizing,
		handleResizePointerDown,
		handleResizePointerMove,
		finishResize,
	} = useResizableDrawer(isMobile);

	const abortRef = useRef<AbortController | null>(null);
	const streamTimerRef = useRef<number | null>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const chatRef = useRef<HTMLDivElement>(null);

	const isProcessing = status === ChatStatus.Processing;

	const clearStreamTimer = (): void => {
		if (streamTimerRef.current !== null) {
			window.clearInterval(streamTimerRef.current);
			streamTimerRef.current = null;
		}
	};

	const abortInFlight = (): void => {
		clearStreamTimer();

		if (abortRef.current) {
			abortRef.current.abort();
			abortRef.current = null;
		}
	};

	const resetTurnState = (): void => {
		abortInFlight();
		setStatus(ChatStatus.Empty);
		setCurrentUserMessage("");
		setCurrentUserPrompt("");
		setRevealedAnswer("");
		setErrorMessage("");
		setLastAction(null);
		setInputValue("");
		setUnresolvedWikiTokens([]);
		setWikiContext(null);
	};

	const handleNewChat = (): void => {
		resetTurnState();
		clearHistory();
	};

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
		if (chatRef.current) {
			chatRef.current.scrollTop = chatRef.current.scrollHeight;
		}
	}, [history, revealedAnswer]);

	const autosizeTextarea = (): void => {
		const textarea = textareaRef.current;

		if (!textarea) {
			return;
		}

		textarea.style.height = "auto";
		textarea.style.height = `${Math.min(140, textarea.scrollHeight)}px`;
	};

	const updateWikiContext = (text: string, caret: number): void => {
		const next = findWikiLinkContext(text, caret);

		setWikiContext(next);
	};

	const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>): void => {
		const next = event.target.value;

		setInputValue(next);
		autosizeTextarea();
		updateWikiContext(next, event.target.selectionStart ?? next.length);
	};

	const handleInputSelect = (): void => {
		const textarea = textareaRef.current;

		if (!textarea) {
			return;
		}

		updateWikiContext(textarea.value, textarea.selectionStart ?? 0);
	};

	const handleWikiSelect = (name: string): void => {
		const textarea = textareaRef.current;

		if (!textarea || !wikiContext) {
			return;
		}

		const caret =
			textarea.selectionStart ??
			wikiContext.start + wikiContext.query.length + 2;
		const before = inputValue.slice(0, wikiContext.start);
		const after = inputValue.slice(caret);
		const insertion = `[[${name}]]`;
		const next = `${before}${insertion}${after}`;
		const nextCaret = before.length + insertion.length;

		setInputValue(next);
		setWikiContext(null);

		requestAnimationFrame(() => {
			const ta = textareaRef.current;

			if (!ta) return;

			ta.focus();
			ta.setSelectionRange(nextCaret, nextCaret);
			autosizeTextarea();
		});
	};

	const handleWikiDismiss = (): void => {
		setWikiContext(null);
	};

	const streamAnswer = (fullText: string): void => {
		let cursor = 0;

		streamTimerRef.current = window.setInterval(() => {
			if (cursor >= fullText.length) {
				clearStreamTimer();
				setRevealedAnswer(fullText);
				setStatus(ChatStatus.Answered);

				return;
			}

			const step =
				minStreamChunk +
				Math.floor(Math.random() * (maxStreamChunk - minStreamChunk + 1));

			cursor = Math.min(cursor + step, fullText.length);
			setRevealedAnswer(fullText.slice(0, cursor));
		}, streamStepMs);
	};

	const commitCurrentTurn = (): void => {
		if (
			currentUserMessage &&
			revealedAnswer &&
			status === ChatStatus.Answered
		) {
			appendMessage({ role: UserRole.User, content: currentUserMessage });

			const isReplaceCandidate = detectReplaceCandidate(
				currentUserPrompt,
				revealedAnswer,
				currentSnippet?.language ?? ""
			);

			appendMessage({
				role: UserRole.Assistant,
				content: revealedAnswer,
				userPrompt: currentUserPrompt || undefined,
				isReplaceCandidate,
			});
		}
	};

	const runRequest = async (
		action: AiAction,
		displayMessage: string,
		userPrompt?: string
	): Promise<void> => {
		if (!currentSnippet?.snippet?.trim()) {
			addToast({
				type: ToastType.Error,
				message: "No code to analyze",
			});

			return;
		}

		clearStreamTimer();

		if (abortRef.current) {
			abortRef.current.abort();
		}

		commitCurrentTurn();

		let effectivePrompt = userPrompt;
		let nextUnresolved: string[] = [];

		if (userPrompt) {
			const { expandedContext, unresolved } = resolveWikiLinks(
				userPrompt,
				allSnippets
			);

			if (expandedContext) {
				effectivePrompt = `${userPrompt}\n\n${expandedContext}`;
			}

			nextUnresolved = unresolved;
		}

		setUnresolvedWikiTokens(nextUnresolved);

		const controller = new AbortController();

		abortRef.current = controller;

		setCurrentUserMessage(displayMessage);
		setCurrentUserPrompt(userPrompt ?? "");
		setRevealedAnswer("");
		setErrorMessage("");
		setLastAction(action);
		setStatus(ChatStatus.Processing);
		setInputValue("");
		setWikiContext(null);
		requestAnimationFrame(autosizeTextarea);

		const historyForRequest: AiHistoryMessage[] =
			action === aiActions.ask
				? useChatStore.getState().history.map((entry) => ({
						role: entry.role,
						content: entry.content,
					}))
				: [];

		try {
			const response = await requestAiAction(
				action,
				currentSnippet.snippet,
				currentSnippet.language,
				{
					userPrompt: effectivePrompt,
					signal: controller.signal,
					history: historyForRequest,
				}
			);

			if (controller.signal.aborted) {
				return;
			}

			setLastUsage(response.usage ?? null);
			streamAnswer(response.result);
		} catch (requestError) {
			if (controller.signal.aborted) {
				return;
			}

			const message =
				requestError instanceof Error
					? requestError.message
					: "AI request failed";

			setErrorMessage(message);
			setStatus(ChatStatus.Error);
		}
	};

	const handleChipClick = (action: AiAction): void => {
		void runRequest(action, aiActionLabels[action]);
	};

	const handleSend = (): void => {
		const trimmed = inputValue.trim();

		if (!trimmed || isProcessing) {
			return;
		}

		void runRequest(aiActions.ask, trimmed, trimmed);
	};

	const handleStop = (): void => {
		if (abortRef.current) {
			abortRef.current.abort();
			abortRef.current = null;
		}

		clearStreamTimer();
		setStatus(ChatStatus.Stopped);
	};

	const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>): void => {
		if (wikiContext) {
			return;
		}

		if (event.key === "Enter" && !event.shiftKey) {
			event.preventDefault();
			handleSend();
		}
	};

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

	if (!isOpen || typeof document === "undefined") {
		return null;
	}

	const isStreaming = isProcessing && revealedAnswer.length > 0;
	const showThinking = isProcessing && revealedAnswer.length === 0;
	const showEmptyState = status === ChatStatus.Empty && history.length === 0;
	const hasCurrentTurn =
		status !== ChatStatus.Empty || currentUserMessage !== "";
	const showApplyButton =
		status === ChatStatus.Answered &&
		lastAction !== null &&
		codeActions.includes(lastAction) &&
		revealedAnswer.length > 0;
	const sendDisabled = inputValue.trim().length === 0 || isProcessing;
	const snippetDisplayName = currentSnippet?.name?.trim() || "Untitled snippet";
	const inputPlaceholder =
		history.length > 0 || currentUserMessage
			? "Ask a follow-up… ([[ to link a snippet)"
			: "Ask something… ([[ to link a snippet)";
	const currentTurnReplaceCandidate =
		status === ChatStatus.Answered &&
		detectReplaceCandidate(
			currentUserPrompt,
			revealedAnswer,
			currentSnippet?.language ?? ""
		);
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
				<ChatMessageList
					currentTurnReplaceCandidate={currentTurnReplaceCandidate}
					currentUserMessage={currentUserMessage}
					errorMessage={errorMessage}
					hasCurrentTurn={hasCurrentTurn}
					history={history}
					isStreaming={isStreaming}
					lastAction={lastAction}
					revealedAnswer={revealedAnswer}
					selectedModel={selectedModel}
					showApplyButton={showApplyButton}
					showEmptyState={showEmptyState}
					showThinking={showThinking}
					status={status}
					onApply={handleApply}
					onChipClick={handleChipClick}
					onCopyToSnippet={handleCopyToSnippet}
					onReplaceSnippet={handleReplaceSnippet}
				/>
			</div>

			<div className={styles.dock}>
				<div className={styles.inputWrap}>
					<WikiLinkPopover
						isOpen={wikiContext !== null}
						query={wikiContext?.query ?? ""}
						snippets={allSnippets}
						onSelect={handleWikiSelect}
						onDismiss={handleWikiDismiss}
					/>
					<div className={styles.inputRow}>
						<textarea
							ref={textareaRef}
							className={styles.prompt}
							placeholder={inputPlaceholder}
							rows={1}
							value={inputValue}
							disabled={isProcessing}
							onChange={handleInputChange}
							onKeyDown={handleKeyDown}
							onSelect={handleInputSelect}
							onClick={handleInputSelect}
						/>
						{isProcessing ? (
							<button
								type="button"
								className={styles.stopButton}
								onClick={handleStop}
								aria-label="Stop"
							>
								<svg width={10} height={10} viewBox="0 0 10 10">
									<rect width={10} height={10} rx={2} fill="currentColor" />
								</svg>
							</button>
						) : (
							<button
								type="button"
								className={styles.sendButton}
								onClick={handleSend}
								disabled={sendDisabled}
								aria-label="Send"
							>
								<svg width={14} height={14} viewBox="0 0 14 14" fill="none">
									<path
										d="M7 12 V2 M7 2 L3 6 M7 2 L11 6"
										stroke="currentColor"
										strokeWidth={1.8}
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
							</button>
						)}
					</div>
					{unresolvedWikiTokens.length > 0 && (
						<div className={styles.unresolvedHint}>
							{unresolvedWikiTokens.map((token) => (
								<span key={token}>
									No snippet found for <code>[[{token}]]</code>
								</span>
							))}
						</div>
					)}
					<div className={styles.dockHint}>
						<ContextUsage usage={lastUsage} />
						<span>
							<span className={styles.kbdInline}>↵</span> send ·{" "}
							<span className={styles.kbdInline}>⇧↵</span> newline ·{" "}
							<span className={styles.kbdInline}>[[</span> link snippet
						</span>
					</div>
				</div>
			</div>
		</aside>
	);

	return createPortal(drawerContent, document.body);
};

export default AiChatModal;
