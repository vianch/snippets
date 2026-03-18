"use client";

import { useState } from "react";

/* Lib */
import useToastStore from "@/lib/store/toast.store";
import { ToastType } from "@/lib/constants/toast";
import { localActions } from "@/lib/constants/ai";
import { getUserDataFromSession } from "@/lib/supabase/queries";

/* Utils */
import { requestAiAction } from "@/utils/ai.utils";

const parseJson = (code: string): string => {
	const parsed = JSON.parse(code);

	return JSON.stringify(parsed, null, 2);
};

type UseAiActionsProps = {
	currentSnippet: CurrentSnippet;
	updateCurrentSnippetValue: (value: string) => void;
};

type UseAiActionsReturn = {
	aiModalOpen: boolean;
	aiLoading: boolean;
	aiResult: string;
	aiError: string;
	aiAction: AiAction | null;
	handleAiAction: (action: AiAction) => Promise<void>;
	handleAiApply: () => void;
	handleAiDiscard: () => void;
};

const useAiActions = ({
	currentSnippet,
	updateCurrentSnippetValue,
}: UseAiActionsProps): UseAiActionsReturn => {
	const { addToast } = useToastStore();
	const [aiModalOpen, setAiModalOpen] = useState(false);
	const [aiLoading, setAiLoading] = useState(false);
	const [aiResult, setAiResult] = useState("");
	const [aiError, setAiError] = useState("");
	const [aiAction, setAiAction] = useState<AiAction | null>(null);

	const handleLocalAction = (action: AiAction): void => {
		try {
			if (action === "json") {
				setAiResult(parseJson(currentSnippet.snippet));
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Invalid JSON";

			setAiError(errorMessage);
		}

		setAiLoading(false);
	};

	const handleRemoteAction = async (action: AiAction): Promise<void> => {
		try {
			const sessionData = await getUserDataFromSession();
			const userMetadata = sessionData?.user?.user_metadata;
			const response = await requestAiAction(
				action,
				currentSnippet.snippet,
				currentSnippet.language,
				userMetadata?.ai_api_key,
				userMetadata?.ollama_model,
				userMetadata?.ollama_url,
				userMetadata?.ollama_api_key
			);

			setAiResult(response.result);
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "AI request failed";

			setAiError(errorMessage);
		}

		setAiLoading(false);
	};

	const handleAiAction = async (action: AiAction): Promise<void> => {
		setAiAction(action);
		setAiResult("");
		setAiError("");
		setAiLoading(true);
		setAiModalOpen(true);

		if (localActions.includes(action)) {
			handleLocalAction(action);
		} else {
			await handleRemoteAction(action);
		}
	};

	const handleAiApply = (): void => {
		updateCurrentSnippetValue(aiResult);
		setAiModalOpen(false);
		addToast({
			type: ToastType.Success,
			message: "AI result applied",
		});
	};

	const handleAiDiscard = (): void => {
		setAiModalOpen(false);
	};

	return {
		aiModalOpen,
		aiLoading,
		aiResult,
		aiError,
		aiAction,
		handleAiAction,
		handleAiApply,
		handleAiDiscard,
	};
};

export default useAiActions;
