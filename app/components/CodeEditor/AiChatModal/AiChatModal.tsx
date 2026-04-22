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
import CloseSquare from "@/components/ui/icons/CloseSquare";
import Sparkle from "@/components/ui/icons/Sparkle";

/* Lib */
import { aiActionLabels, chipActions, codeActions } from "@/lib/constants/ai";
import { ToastType } from "@/lib/constants/toast";
import useToastStore from "@/lib/store/toast.store";
import { getUserDataFromSession } from "@/lib/supabase/queries";

/* Utils */
import { requestAiAction } from "@/utils/ai.utils";

/* Styles */
import styles from "./aiChatModal.module.css";

type ChatStatus = "empty" | "processing" | "answered" | "stopped" | "error";

type AiChatModalProps = {
	isOpen: boolean;
	currentSnippet: CurrentSnippet;
	onClose: () => void;
	onApplyCode: (code: string) => void;
};

const streamStepMs = 18;
const minStreamChunk = 2;
const maxStreamChunk = 5;

const AiChatModal = ({
	isOpen,
	currentSnippet,
	onClose,
	onApplyCode,
}: AiChatModalProps): ReactElement | null => {
	const { addToast } = useToastStore();
	const [status, setStatus] = useState<ChatStatus>("empty");
	const [userMessage, setUserMessage] = useState<string>("");
	const [revealedAnswer, setRevealedAnswer] = useState<string>("");
	const [errorMessage, setErrorMessage] = useState<string>("");
	const [lastAction, setLastAction] = useState<AiAction | null>(null);
	const [inputValue, setInputValue] = useState<string>("");
	const abortRef = useRef<AbortController | null>(null);
	const streamTimerRef = useRef<number | null>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const isProcessing = status === "processing";
	const showApplyButton =
		status === "answered" &&
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

		setStatus("empty");
		setUserMessage("");
		setRevealedAnswer("");
		setErrorMessage("");
		setLastAction(null);
		setInputValue("");
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
		document.body.style.overflow = "hidden";

		return () => {
			document.removeEventListener("keydown", handleEscape);
			document.body.style.overflow = "unset";
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
		}
	}, [isOpen]);

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
				setStatus("answered");

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

		const controller = new AbortController();

		abortRef.current = controller;

		setUserMessage(displayMessage);
		setRevealedAnswer("");
		setErrorMessage("");
		setLastAction(action);
		setStatus("processing");
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
			setStatus("error");
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

		void runRequest("ask", trimmed, trimmed);
	};

	const handleStop = (): void => {
		if (abortRef.current) {
			abortRef.current.abort();
			abortRef.current = null;
		}

		clearStreamTimer();
		setStatus("stopped");
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

	const handleOverlayClick = (
		event: React.MouseEvent<HTMLDivElement>
	): void => {
		if (event.target === event.currentTarget) {
			onClose();
		}
	};

	if (!isOpen || typeof document === "undefined") {
		return null;
	}

	const showEmptyState = status === "empty";
	const isStreaming = isProcessing && revealedAnswer.length > 0;
	const showThinking = isProcessing && revealedAnswer.length === 0;
	const sendDisabled = inputValue.trim().length === 0 || isProcessing;
	const snippetDisplayName = currentSnippet?.name?.trim() || "Untitled snippet";

	const modalContent = (
		<div className={styles.overlay} onClick={handleOverlayClick}>
			<div
				className={styles.modal}
				role="dialog"
				aria-modal="true"
				aria-label="Ask AI"
				onClick={(event) => event.stopPropagation()}
			>
				<div className={styles.header}>
					<h2 className={styles.title}>
						<span className={styles.titleIcon}>
							<Sparkle width={18} height={18} />
						</span>
						<span>Ask AI</span>
						<span className={styles.subtitle}>· {snippetDisplayName}</span>
					</h2>
					<div className={styles.headerActions}>
						<span className={styles.kbdHint}>Esc</span>
						<button
							type="button"
							className={styles.closeButton}
							onClick={onClose}
							aria-label="Close"
						>
							<CloseSquare width={18} height={18} />
						</button>
					</div>
				</div>

				<div className={styles.chat}>
					{showEmptyState ? (
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
					) : (
						<>
							{userMessage && (
								<div className={styles.userTurn}>{userMessage}</div>
							)}

							<div className={styles.assistantTurn}>
								<div className={styles.assistantHeader}>
									<span className={styles.assistantHeaderIcon}>
										<Sparkle width={14} height={14} />
									</span>
									<span>AI</span>
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
									status === "answered" ||
									status === "stopped") &&
									revealedAnswer.length > 0 && (
										<div className={styles.assistantBody}>
											{revealedAnswer}
											{isStreaming && <span className={styles.caret} />}
										</div>
									)}

								{status === "stopped" && (
									<div className={styles.stoppedNote}>
										<span className={styles.stoppedDot} />
										<span>Stopped</span>
									</div>
								)}

								{status === "error" && errorMessage && (
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
								placeholder="Ask something else..."
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
			</div>
		</div>
	);

	return createPortal(modalContent, document.body);
};

export default AiChatModal;
