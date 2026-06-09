import { ChangeEvent, ReactElement } from "react";

import { aiProviders } from "@/lib/constants/account";
import Input from "@/components/ui/Input/Input";
import Loading from "@/components/ui/icons/Loading";
import Lock from "@/components/ui/icons/Lock";

import styles from "./accountModal.module.css";

type AiSettingsTabProps = {
	aiModels: string[];
	modelsLoading: boolean;
	userData: InitialAccountStateData;
	onInputChange: (event: ChangeEvent<HTMLInputElement>, field: string) => void;
	onModelChange: (model: string) => void;
	onProviderChange: (provider: AiProvider) => Promise<void>;
	onRefreshModels: () => Promise<void>;
};

const AiSettingsTab = ({
	aiModels,
	modelsLoading,
	userData,
	onInputChange,
	onModelChange,
	onProviderChange,
	onRefreshModels,
}: AiSettingsTabProps): ReactElement => {
	const providerLabel: Record<AiProvider, string> = {
		claude: "Claude (Anthropic)",
		nvidia: "NVIDIA",
		ollama: "Ollama",
		openai: "OpenAI",
	};

	const apiKeyPlaceholder: Record<AiProvider, string> = {
		claude: "sk-ant-...",
		nvidia: "nvapi-...",
		ollama: "ollama-api-key...",
		openai: "sk-...",
	};

	const apiKeyHelpText: Record<AiProvider, string> = {
		claude: "Get your API key at console.anthropic.com",
		nvidia: "Get your API key at build.nvidia.com",
		ollama: "Required only for ollama.com cloud models",
		openai: "Get your API key at platform.openai.com/api-keys",
	};

	const activeProvider = userData.aiProvider ?? "ollama";

	const renderModelSelector = (): ReactElement => {
		if (modelsLoading) {
			return (
				<div className={styles.modelLoadGroup}>
					<Loading width={16} height={16} />
					<small className={styles.helpText}>Loading models...</small>
				</div>
			);
		}

		if (userData.aiProvider === "nvidia") {
			return (
				<div className={styles.modelLoadGroup}>
					<small className={styles.helpText}>
						{aiModels[0] ?? "meta/llama-3.1-70b-instruct"}
					</small>
				</div>
			);
		}

		if (aiModels.length > 0) {
			return (
				<select
					className={styles.modelSelect}
					value={userData.aiModel ?? ""}
					onChange={(event) => onModelChange(event.target.value)}
				>
					<option value="">Use default</option>
					{aiModels.map((model) => (
						<option key={model} value={model}>
							{model}
						</option>
					))}
				</select>
			);
		}

		return (
			<div className={styles.modelLoadGroup}>
				<small className={styles.helpText}>
					No models found — enter credentials and click Load Models
				</small>
				<button
					type="button"
					className={styles.loadModelsButton}
					onClick={() => void onRefreshModels()}
				>
					Load Models
				</button>
			</div>
		);
	};

	return (
		<>
			<div className={styles.section}>
				<h3 className={styles.sectionTitle}>Provider</h3>
				<div className={styles.inputGroup}>
					<span className={styles.label}>AI Provider</span>
					<select
						className={styles.modelSelect}
						value={activeProvider}
						onChange={(event) =>
							void onProviderChange(event.target.value as AiProvider)
						}
					>
						{aiProviders.map((provider) => (
							<option key={provider.value} value={provider.value}>
								{provider.label}
							</option>
						))}
					</select>
				</div>
			</div>

			<div className={styles.section}>
				<h3 className={styles.sectionTitle}>{providerLabel[activeProvider]}</h3>

				{userData.aiProvider === "ollama" && (
					<div className={styles.inputGroup}>
						<span className={styles.label}>Endpoint URL</span>
						<Input
							type="text"
							name="aiUrl"
							placeholder="https://ollama.yourdomain.com"
							fat
							value={userData.aiUrl ?? ""}
							onChange={(event: ChangeEvent<HTMLInputElement>) =>
								onInputChange(event, "aiUrl")
							}
							disableMargin
							className={styles.input}
							maxLength={200}
						/>
						<small className={styles.helpText}>
							Leave empty to use the default local endpoint. Models refresh
							after saving.
						</small>
					</div>
				)}

				<div className={styles.inputGroup}>
					<span className={styles.label}>API Key</span>
					<Input
						type="password"
						name="aiApiKey"
						placeholder={apiKeyPlaceholder[activeProvider]}
						fat
						value={userData.aiApiKey ?? ""}
						onChange={(event: ChangeEvent<HTMLInputElement>) =>
							onInputChange(event, "aiApiKey")
						}
						disableMargin
						Icon={<Lock width={18} height={18} />}
						className={styles.input}
						maxLength={255}
					/>
					<small className={styles.helpText}>
						{apiKeyHelpText[activeProvider]}
					</small>
				</div>

				<div className={styles.inputGroup}>
					<span className={styles.label}>Model</span>
					{renderModelSelector()}
				</div>
			</div>
		</>
	);
};

export default AiSettingsTab;
