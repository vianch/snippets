"use client";

import { useState } from "react";

/* Lib */
import useToastStore from "@/lib/store/toast.store";
import { ToastType } from "@/lib/constants/toast";

type UseSnippetActionsProps = {
	currentSnippet: CurrentSnippet;
};

type UseSnippetActionsReturn = {
	aiChatOpen: boolean;
	screenshotModalOpen: boolean;
	closeAiChat: () => void;
	closeScreenshotModal: () => void;
	copyHandler: () => Promise<void>;
	openAiChat: () => void;
	openScreenshotModal: () => void;
	shareHandler: () => Promise<void>;
};

// Snippet-level actions shared by the mobile action strip and the desktop
// overflow menu. Each consumer owns its own modal instances, so the open state
// lives here alongside the handlers that flip it.
const useSnippetActions = ({
	currentSnippet,
}: UseSnippetActionsProps): UseSnippetActionsReturn => {
	const { addToast } = useToastStore();
	const [aiChatOpen, setAiChatOpen] = useState(false);
	const [screenshotModalOpen, setScreenshotModalOpen] = useState(false);

	const copyHandler = async (): Promise<void> => {
		try {
			await navigator.clipboard.writeText(currentSnippet?.snippet ?? "");
			addToast({
				type: ToastType.Success,
				message: "Code copied to clipboard",
			});
		} catch (_error) {
			addToast({
				type: ToastType.Error,
				message: "Failed to copy code to clipboard",
			});
		}
	};

	const shareHandler = async (): Promise<void> => {
		if (navigator?.share) {
			await navigator.share({
				title: `Code Snippet: ${currentSnippet?.name ?? "Untitled"}`,
				text: currentSnippet?.snippet ?? "",
			});
		} else {
			const shareData = `Code Snippet: ${currentSnippet?.name ?? "Untitled"}\n\n${currentSnippet?.snippet ?? ""}`;

			await navigator.clipboard.writeText(shareData);
			addToast({
				type: ToastType.Success,
				message: "Code copied to clipboard for sharing",
			});
		}
	};

	const openAiChat = (): void => {
		if (!currentSnippet?.snippet?.trim()) {
			addToast({
				type: ToastType.Error,
				message: "No code to analyze",
			});

			return;
		}

		setAiChatOpen(true);
	};

	return {
		aiChatOpen,
		screenshotModalOpen,
		closeAiChat: () => setAiChatOpen(false),
		closeScreenshotModal: () => setScreenshotModalOpen(false),
		copyHandler,
		openAiChat,
		openScreenshotModal: () => setScreenshotModalOpen(true),
		shareHandler,
	};
};

export default useSnippetActions;
