"use client";

import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from "react";

/* Lib */
import {
	aiActionLabels,
	aiActions,
	ChatStatus,
	codeActions,
	ScrollPinThresholdPx,
	UserRole,
} from "@/lib/constants/ai";
import { ToastType } from "@/lib/constants/toast";
import useChatStore from "@/lib/store/chat.store";
import useToastStore from "@/lib/store/toast.store";
import { resolveWikiLinks } from "@/lib/wikiLinkResolver";

/* Utils */
import { requestAiAction } from "@/utils/ai.utils";
import {
	detectReplaceCandidate,
	findWikiLinkContext,
} from "@/utils/chat.utils";

const useAiChat = ({
	allSnippets,
	currentSnippet,
	missingSnippetMessage,
}: UseAiChatOptions) => {
	const { addToast } = useToastStore();
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
	const [thinkingText, setThinkingText] = useState<string>("");
	const [errorMessage, setErrorMessage] = useState<string>("");
	const [lastAction, setLastAction] = useState<AiAction | null>(null);
	const [inputValue, setInputValue] = useState<string>("");
	const [unresolvedWikiTokens, setUnresolvedWikiTokens] = useState<string[]>(
		[]
	);
	const [wikiContext, setWikiContext] = useState<WikiLinkContext | null>(null);

	const abortRef = useRef<AbortController | null>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const chatRef = useRef<HTMLDivElement>(null);

	const isProcessing = status === ChatStatus.Processing;
	const snippetLanguage = currentSnippet?.language ?? "";

	const abortInFlight = (): void => {
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
		setThinkingText("");
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
		const chat = chatRef.current;

		if (!chat) {
			return;
		}

		const distanceFromBottom =
			chat.scrollHeight - chat.scrollTop - chat.clientHeight;

		if (distanceFromBottom < ScrollPinThresholdPx) {
			chat.scrollTop = chat.scrollHeight;
		}
	}, [history, revealedAnswer, thinkingText]);

	useEffect(() => {
		return () => {
			if (abortRef.current) {
				abortRef.current.abort();
			}
		};
	}, []);

	const autosizeTextarea = (): void => {
		const textarea = textareaRef.current;

		if (!textarea) {
			return;
		}

		textarea.style.height = "auto";
		textarea.style.height = `${Math.min(140, textarea.scrollHeight)}px`;
	};

	const updateWikiContext = (text: string, caret: number): void => {
		setWikiContext(findWikiLinkContext(text, caret));
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
			const element = textareaRef.current;

			if (!element) {
				return;
			}

			element.focus();
			element.setSelectionRange(nextCaret, nextCaret);
			autosizeTextarea();
		});
	};

	const handleWikiDismiss = (): void => {
		setWikiContext(null);
	};

	const commitCurrentTurn = (): void => {
		const turnAnswered = status === ChatStatus.Answered;
		const turnStoppedWithAnswer =
			status === ChatStatus.Stopped && revealedAnswer.length > 0;

		if (
			currentUserMessage &&
			revealedAnswer &&
			(turnAnswered || turnStoppedWithAnswer)
		) {
			appendMessage({ role: UserRole.User, content: currentUserMessage });

			const isReplaceCandidate = detectReplaceCandidate(
				currentUserPrompt,
				revealedAnswer,
				snippetLanguage
			);

			appendMessage({
				role: UserRole.Assistant,
				content: revealedAnswer,
				userPrompt: currentUserPrompt || undefined,
				thinking: thinkingText || undefined,
				isReplaceCandidate,
				stopped: turnStoppedWithAnswer || undefined,
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
				message: missingSnippetMessage,
			});

			return;
		}

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
		setThinkingText("");
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

		let streamedAnswer = "";
		let pendingText = "";
		let pendingThinking = "";
		let flushHandle = 0;

		const flushPending = (): void => {
			flushHandle = 0;

			if (controller.signal.aborted) {
				pendingText = "";
				pendingThinking = "";

				return;
			}

			if (pendingText.length > 0) {
				const chunk = pendingText;

				pendingText = "";
				setRevealedAnswer((previous) => previous + chunk);
			}

			if (pendingThinking.length > 0) {
				const chunk = pendingThinking;

				pendingThinking = "";
				setThinkingText((previous) => previous + chunk);
			}
		};

		const scheduleFlush = (): void => {
			if (flushHandle !== 0) {
				return;
			}

			flushHandle = requestAnimationFrame(flushPending);
		};

		const cancelFlush = (): void => {
			if (flushHandle !== 0) {
				cancelAnimationFrame(flushHandle);
				flushHandle = 0;
			}

			pendingText = "";
			pendingThinking = "";
		};

		try {
			const response = await requestAiAction(
				action,
				currentSnippet.snippet,
				currentSnippet.language,
				{
					userPrompt: effectivePrompt,
					signal: controller.signal,
					history: historyForRequest,
					onThinkingDelta: (delta) => {
						pendingThinking += delta;
						scheduleFlush();
					},
					onTextDelta: (delta) => {
						streamedAnswer += delta;
						pendingText += delta;
						scheduleFlush();
					},
				}
			);

			cancelFlush();

			if (controller.signal.aborted) {
				return;
			}

			setLastUsage(response.usage ?? null);
			setRevealedAnswer(response.result);
			setThinkingText(response.thinking ?? "");
			setStatus(ChatStatus.Answered);
		} catch (requestError) {
			cancelFlush();

			if (controller.signal.aborted) {
				return;
			}

			if (streamedAnswer.trim().length > 0) {
				setRevealedAnswer(streamedAnswer);
				setStatus(ChatStatus.Answered);

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

	const isAnswered = status === ChatStatus.Answered;
	const isStopped = status === ChatStatus.Stopped;
	const isStreaming = isProcessing && revealedAnswer.length > 0;
	const showThinking = isProcessing && revealedAnswer.length === 0;
	const showEmptyState = status === ChatStatus.Empty && history.length === 0;
	const hasCurrentTurn =
		status !== ChatStatus.Empty || currentUserMessage !== "";
	const sendDisabled = inputValue.trim().length === 0 || isProcessing;
	const showApplyButton =
		isAnswered &&
		lastAction !== null &&
		codeActions.includes(lastAction) &&
		revealedAnswer.length > 0;
	const showTurnActions = isAnswered && lastAction === aiActions.ask;
	const currentTurnReplaceCandidate =
		isAnswered &&
		detectReplaceCandidate(currentUserPrompt, revealedAnswer, snippetLanguage);

	return {
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
	};
};

export default useAiChat;
