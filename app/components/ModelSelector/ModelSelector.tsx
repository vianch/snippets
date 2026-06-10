"use client";

import { ChangeEvent, ReactElement, useEffect, useState } from "react";

/* Lib */
import { AiProviderId } from "@/lib/constants/ai";
import { ToastType } from "@/lib/constants/toast";
import useChatStore from "@/lib/store/chat.store";
import useToastStore from "@/lib/store/toast.store";
import { getUserDataFromSession, updateUser } from "@/lib/supabase/queries";

/* Utils */
import { fetchAiModels, formatModelLabel } from "@/utils/ai.utils";

/* Styles */
import styles from "./modelSelector.module.css";

type ModelSelectorProps = {
	compact?: boolean;
};

const ModelSelector = ({
	compact = false,
}: ModelSelectorProps): ReactElement => {
	const selectedModel = useChatStore((state) => state.selectedModel);
	const setSelectedModel = useChatStore((state) => state.setSelectedModel);
	const addToast = useToastStore((state) => state.addToast);

	const [models, setModels] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isSaving, setIsSaving] = useState<boolean>(false);

	useEffect(() => {
		let cancelled = false;

		const loadModels = async (): Promise<void> => {
			setIsLoading(true);

			const session = await getUserDataFromSession();
			const metadata = session?.user?.user_metadata ?? {};
			const activeProvider =
				(metadata.ai_provider as AiProvider) ?? AiProviderId.Ollama;

			if (cancelled) return;

			if (metadata.ai_model && !selectedModel) {
				setSelectedModel(metadata.ai_model);
			}

			const { models: fetched } = await fetchAiModels(activeProvider, {
				apiKey:
					activeProvider !== AiProviderId.Ollama
						? (metadata.ai_api_key as string | undefined)
						: undefined,
				ollamaUrl:
					activeProvider === AiProviderId.Ollama
						? (metadata.ai_url as string | undefined)
						: undefined,
				ollamaApiKey:
					activeProvider === AiProviderId.Ollama
						? (metadata.ai_api_key as string | undefined)
						: undefined,
			});

			if (cancelled) return;

			setModels(fetched);
			setIsLoading(false);
		};

		void loadModels();

		return () => {
			cancelled = true;
		};
	}, []);

	const handleChange = async (
		event: ChangeEvent<HTMLSelectElement>
	): Promise<void> => {
		const nextModel = event.target.value;
		const previousModel = selectedModel;

		setSelectedModel(nextModel);
		setIsSaving(true);

		const { error } = await updateUser({ data: { ai_model: nextModel } });

		setIsSaving(false);

		if (error) {
			setSelectedModel(previousModel);
			addToast({
				type: ToastType.Error,
				message: "Failed to save model selection",
			});
		}
	};

	const placeholder = isLoading ? "…" : "default";

	return (
		<select
			className={compact ? styles.compactSelect : styles.select}
			value={selectedModel}
			onChange={handleChange}
			disabled={isLoading || isSaving || models.length === 0}
			aria-label="AI model"
			title={selectedModel || "AI model"}
		>
			<option value="">{placeholder}</option>
			{models.map((model) => (
				<option key={model} value={model}>
					{formatModelLabel(model)}
				</option>
			))}
		</select>
	);
};

export default ModelSelector;
