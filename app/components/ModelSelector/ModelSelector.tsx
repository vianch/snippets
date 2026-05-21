"use client";

import { ChangeEvent, ReactElement, useEffect, useState } from "react";

/* Lib */
import useChatStore from "@/lib/store/chat.store";
import { getUserDataFromSession } from "@/lib/supabase/queries";

/* Utils */
import { fetchAiModels } from "@/utils/ai.utils";

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

	const [models, setModels] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	useEffect(() => {
		let cancelled = false;

		const loadModels = async (): Promise<void> => {
			setIsLoading(true);

			const session = await getUserDataFromSession();
			const metadata = session?.user?.user_metadata ?? {};
			const activeProvider = (metadata.ai_provider as AiProvider) ?? "ollama";

			if (cancelled) return;

			if (metadata.ai_model && !selectedModel) {
				setSelectedModel(metadata.ai_model);
			}

			const { models: fetched } = await fetchAiModels(activeProvider, {
				apiKey:
					activeProvider !== "ollama"
						? (metadata.ai_api_key as string | undefined)
						: undefined,
				ollamaUrl:
					activeProvider === "ollama"
						? (metadata.ai_url as string | undefined)
						: undefined,
				ollamaApiKey:
					activeProvider === "ollama"
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

	const handleChange = (event: ChangeEvent<HTMLSelectElement>): void => {
		setSelectedModel(event.target.value);
	};

	const placeholder = isLoading ? "…" : "default";

	return (
		<select
			className={compact ? styles.compactSelect : styles.select}
			value={selectedModel}
			onChange={handleChange}
			disabled={isLoading || models.length === 0}
			aria-label="AI model"
			title={selectedModel || "AI model"}
		>
			<option value="">{placeholder}</option>
			{models.map((model) => (
				<option key={model} value={model}>
					{model}
				</option>
			))}
		</select>
	);
};

export default ModelSelector;
