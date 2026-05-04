"use client";

import {
	ChangeEvent,
	KeyboardEvent,
	ReactElement,
	useEffect,
	useRef,
	useState,
} from "react";
import { createPortal } from "react-dom";

/* Components */
import Sparkle from "@/components/ui/icons/Sparkle";

/* Lib */
import {
	ChatStatus,
	aiActionLabels,
	aiActions,
	chipActions,
	codeActions,
	maxStreamChunk,
	minStreamChunk,
	streamStepMs,
} from "@/lib/constants/ai";
import { ToastType } from "@/lib/constants/toast";
import useToastStore from "@/lib/store/toast.store";
import { getUserDataFromSession } from "@/lib/supabase/queries";

/* Utils */
import { requestAiAction } from "@/utils/ai.utils";

/* Styles */
import styles from "./aiChatModal.module.css";

type ChatEntry = {
	role: "user" | "assistant";
	content: string;
};

type AiChatModalProps = {
	isOpen: boolean;
	currentSnippet: CurrentSnippet;
	onClose: () => void;
	onApplyCode: (code: string) => void;
};

const AiChatModal = ({
	isOpen,
	currentSnippet,
	onClose,
	onApplyCode,
}: AiChatModalProps): ReactElement | null => {
	const { addToast } = useToastStore();
	const [status, setStatus] = useState<ChatStatus>(ChatStatus.Empty);
	const [currentUserMessage, setCurrentUserMessage] = useState<string>("");
	const [revealedAnswer, setRevealedAnswer] = useState<string>("");
	const [errorMessage, setErrorMessage] = useState<string>("");
	const [lastAction, setLastAction] = useState<AiAction | null>(null);
	const [inputValue, setInputValue] = useState<string>("");
	const [selectedModel, setSelectedModel] = useState<string>("");
	const [history, setHistory] = useState<ChatEntry[]>([]);
	const abortRef = useRef<AbortController | null>(null);
	const streamTimerRef = useRef<number | null>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const chatRef = useRef<HTMLDivElement>(null);

	const isProcessing = status === ChatStatus.Processing;
	const showApplyButton =
		status === ChatStatus.Answered &&
		lastAction !== null &&
		codeActions.includes(lastAction) &&
		revealedAnswer.length > 0;

	const clearStreamTimer = (): void => {
		if (streamTimerRef.current !== null) {
			window.clearInterval(streamTimerRef.current);
			streamTimerRef.current = null;
		}
	};

	const resetConversation = (): void => {
		clearStreamTimer();

		if (abortRef.current) {
			abortRef.current.abort();
			abortRef.current = null;
		}

		setStatus(ChatStatus.Empty);
		setCurrentUserMessage("");
		setRevealedAnswer("");
		setErrorMessage("");
		setLastAction(null);
		setInputValue("");
		setHistory([]);
	};

	useEffect(() => {
		if (!isOpen) {
			clearStreamTimer();

			if (abortRef.current) {
				abortRef.current.abort();
				abortRef.current = null;
			}

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
			resetConversation();

			return;
		}

		getUserDataFromSession().then((session) => {
			const model = session?.user?.user_metadata?.ollama_model;

			setSelectedModel(model ?? "");
		});
	}, [isOpen]);

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

	const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>): void => {
		setInputValue(event.target.value);
		autosizeTextarea();
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

		if (
			currentUserMessage &&
			revealedAnswer &&
			status === ChatStatus.Answered
		) {
			setHistory((prev) => [
				...prev,
				{ role: "user", content: currentUserMessage },
				{ role: "assistant", content: revealedAnswer },
			]);
		}

		const controller = new AbortController();

		abortRef.current = controller;

		setCurrentUserMessage(displayMessage);
		setRevealedAnswer("");
		setErrorMessage("");
		setLastAction(action);
		setStatus(ChatStatus.Processing);
		setInputValue("");
		requestAnimationFrame(autosizeTextarea);

		try {
			const session = await getUserDataFromSession();
			const metadata = session?.user?.user_metadata;
			const response = await requestAiAction(
				action,
				currentSnippet.snippet,
				currentSnippet.language,
				{
					apiKey: metadata?.ai_api_key,
					ollamaModel: metadata?.ollama_model,
					ollamaUrl: metadata?.ollama_url,
					ollamaApiKey: metadata?.ollama_api_key,
					userPrompt,
					signal: controller.signal,
				}
			);

			if (controller.signal.aborted) {
				return;
			}

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

	if (!isOpen || typeof document === "undefined") {
		return null;
	}

	const showEmptyState = status === ChatStatus.Empty && history.length === 0;
	const isStreaming = isProcessing && revealedAnswer.length > 0;
	const showThinking = isProcessing && revealedAnswer.length === 0;
	const sendDisabled = inputValue.trim().length === 0 || isProcessing;
	const snippetDisplayName = currentSnippet?.name?.trim() || "Untitled snippet";
	const hasCurrentTurn =
		status !== ChatStatus.Empty || currentUserMessage !== "";
	const inputPlaceholder =
		history.length > 0 || currentUserMessage
			? "Ask a follow-up…"
			: "Ask something…";

	const drawerContent = (
		<aside className={styles.drawer} role="complementary" aria-label="Ask AI">
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
						onClick={resetConversation}
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
					<div className={styles.empty}>
						<span className={styles.emptyIcon}>
							<Sparkle width={36} height={36} />
						</span>
						<h3 className={styles.emptyHeading}>What can I help you with?</h3>
						<p className={styles.emptySubtext}>
							Ask about the snippet on screen — explain it, refactor it, add
							comments, or anything else.
						</p>
						<div className={styles.chips}>
							{chipActions.map((action) => (
								<button
									key={action}
									type="button"
									className={styles.chip}
									onClick={() => handleChipClick(action)}
								>
									{aiActionLabels[action]}
								</button>
							))}
						</div>
					</div>
				)}

				{history.map((entry, index) =>
					entry.role === "user" ? (
						<div key={index} className={styles.userTurn}>
							{entry.content}
						</div>
					) : (
						<div key={index} className={styles.assistantTurn}>
							<div className={styles.assistantHeader}>
								<span className={styles.assistantHeaderIcon}>
									<Sparkle width={14} height={14} />
								</span>
								<span>{selectedModel || "AI"}</span>
							</div>
							<div className={styles.assistantBody}>{entry.content}</div>
						</div>
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

							{(isStreaming ||
								status === ChatStatus.Answered ||
								status === ChatStatus.Stopped) &&
								revealedAnswer.length > 0 && (
									<div className={styles.assistantBody}>
										{revealedAnswer}
										{isStreaming && <span className={styles.caret} />}
									</div>
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
									onClick={handleApply}
								>
									Apply to editor
								</button>
							)}
						</div>
					</>
				)}
			</div>

			<div className={styles.dock}>
				<div className={styles.inputWrap}>
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
					<div className={styles.dockHint}>
						<span>
							<span className={styles.kbdInline}>↵</span> send ·{" "}
							<span className={styles.kbdInline}>⇧↵</span> newline
						</span>
					</div>
				</div>
			</div>
		</aside>
	);

	return createPortal(drawerContent, document.body);
};

export default AiChatModal;
