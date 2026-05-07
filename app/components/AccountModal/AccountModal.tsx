import {
	ReactElement,
	useState,
	useEffect,
	FormEvent,
	ChangeEvent,
} from "react";

/* Lib */
import {
	getUserDataFromSession,
	getUserEmailBySession,
	updateUser,
} from "@/lib/supabase/queries";
import { ThemeName, isValidTheme } from "@/lib/config/themes";
import { setCookie } from "@/lib/cookies";
import { themeCookieName } from "@/lib/constants/cookies";

/* Constants */
import {
	avatarImages,
	accountInitialStateData,
	aiProviders,
	modalCloseDelay,
} from "@/lib/constants/account";
import { FormMessageTypes } from "@/lib/constants/form";

/* Components */
import Modal from "@/components/ui/Modal/Modal";
import Input from "@/components/ui/Input/Input";
import Button from "@/components/ui/Button/Button";
import Alert from "@/components/ui/Alert/Alert";
import Tabs from "@/components/ui/Tabs/Tabs";
import ThemePreview from "@/components/AccountModal/ThemePreview";

/* Store */
import useUserStore from "@/lib/store/user.store";

/* Utils */
import { isUserEmailDemo } from "@/utils/account.utils";
import { fetchAiModels } from "@/utils/ai.utils";

/* Icons */
import Envelope from "@/components/ui/icons/Envelope";
import Lock from "@/components/ui/icons/Lock";
import Loading from "@/components/ui/icons/Loading";

/* Styles */
import styles from "./accountModal.module.css";

interface AccountModalProps {
	isOpen: boolean;
	onClose: () => void;
}

const AccountModal = ({ isOpen, onClose }: AccountModalProps): ReactElement => {
	const [loading, setLoading] = useState(false);
	const {
		userName: currentUserName,
		userAvatar: currentUserAvatar,
		setUserData: setStoreUserData,
	} = useUserStore();

	const [userData, setUserData] = useState<InitialAccountStateData>(
		accountInitialStateData
	);
	const [message, setMessage] = useState<{
		text: string;
		type: FormMessageTypes;
	}>({ text: "", type: FormMessageTypes.Unset });
	const [avatarOptions] = useState(avatarImages);
	const [originalTheme, setOriginalTheme] = useState<string | undefined>(
		accountInitialStateData.theme
	);
	const [aiModels, setAiModels] = useState<string[]>([]);
	const [originalAiUrl, setOriginalAiUrl] = useState<string>("");
	const [modelsLoading, setModelsLoading] = useState(false);

	const handleInputChange = (
		event: ChangeEvent<HTMLInputElement>,
		fieldName: string
	): void => {
		if (!isUserEmailDemo(userData?.email ?? "")) {
			const { value } = event.target;

			setUserData((prev) => ({
				...prev,
				[fieldName]: value,
			}));
		}
	};

	const handleAvatarChange = (avatarPath: string): void => {
		setUserData((prev) => ({
			...prev,
			avatar: avatarPath,
		}));
	};

	const handleThemeChange = (themeName: ThemeName): void => {
		setUserData((prev) => ({
			...prev,
			theme: themeName,
		}));

		useUserStore.getState().setTheme(themeName);
	};

	// Apply theme to the document whenever userData.theme changes (optimistic update)
	useEffect(() => {
		if (userData.theme) {
			document.documentElement.dataset.theme = userData.theme;
			setCookie(themeCookieName, userData.theme);
		}
	}, [userData.theme]);

	const refreshModels = async (provider?: AiProvider): Promise<void> => {
		const activeProvider = provider ?? userData.aiProvider ?? "ollama";

		setModelsLoading(true);
		resetMessages();

		const { models, error } = await fetchAiModels(activeProvider, {
			apiKey: activeProvider !== "ollama" ? userData.aiApiKey : undefined,
			ollamaUrl: activeProvider === "ollama" ? userData.aiUrl : undefined,
			ollamaApiKey: activeProvider === "ollama" ? userData.aiApiKey : undefined,
		});

		if (error) {
			setMessage({ text: error, type: FormMessageTypes.Error });
		}

		setAiModels(models);
		setModelsLoading(false);
	};

	const handleProviderChange = async (provider: AiProvider): Promise<void> => {
		setUserData((prev) => ({ ...prev, aiProvider: provider, aiModel: "" }));
		setAiModels([]);

		const hasCredentials = provider === "ollama" || !!userData.aiApiKey;

		if (hasCredentials) {
			await refreshModels(provider);
		}
	};

	const checkForUserDataChanges = () => {
		const hasUserNameChanged = userData.username !== currentUserName;
		const hasUserAvatarChanged = userData.avatar !== currentUserAvatar;

		return { hasUserNameChanged, hasUserAvatarChanged };
	};

	const updatePassword = async (): Promise<Error | null> => {
		if (userData.newPassword) {
			if (userData.newPassword !== userData.confirmPassword) {
				setMessage({
					text: "New passwords do not match",
					type: FormMessageTypes.Error,
				});

				return new Error("Passwords do not match");
			}

			if (userData?.newPassword?.length < 6) {
				setMessage({
					text: "Password must be at least 6 characters",
					type: FormMessageTypes.Error,
				});

				return Error("Password too short");
			}

			const { error: passwordError } = await updateUser({
				password: userData.newPassword,
			});

			if (passwordError) {
				setMessage({
					text: passwordError.message,
					type: FormMessageTypes.Error,
				});

				return passwordError;
			}
		}

		return null;
	};

	const updateUserMetadata = async (): Promise<Error | null> => {
		const updatePayload: Record<string, string | boolean | undefined> = {
			username: userData.username,
			avatar: userData.avatar,
			theme: userData.theme,
			auto_save: userData.autoSave ?? false,
			ai_provider: userData.aiProvider ?? "ollama",
			ai_api_key: userData.aiApiKey ?? "",
			ai_model: userData.aiModel ?? "",
			ai_url: userData.aiUrl ?? "",
		};

		const { error: updateError } = await updateUser({
			data: updatePayload,
		});

		if (updateError) {
			setMessage({ text: updateError.message, type: FormMessageTypes.Error });

			return updateError;
		}

		return null;
	};

	const updateUserStore = (): void => {
		const { hasUserNameChanged, hasUserAvatarChanged } =
			checkForUserDataChanges();
		const hasThemeChanged = userData.theme !== originalTheme;

		useUserStore.getState().setAutoSave(userData.autoSave ?? false);

		if (hasUserNameChanged || hasUserAvatarChanged || hasThemeChanged) {
			setStoreUserData({
				userName: userData.username,
				userAvatar: userData.avatar,
				email: userData.email,
				theme: userData.theme,
			});

			if (hasThemeChanged) {
				setOriginalTheme(userData.theme);
			}
		}
	};

	const resetStateData = (): void => {
		setUserData((prev) => ({
			...prev,
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		}));
	};

	const resetMessages = (): void => {
		setMessage({ text: "", type: FormMessageTypes.Unset });
	};

	const handleSubmit = async (
		event: FormEvent<HTMLFormElement>
	): Promise<void> => {
		event.preventDefault();
		setLoading(true);
		resetMessages();

		try {
			const updatePasswordError = await updatePassword();
			const updateMetadataError = await updateUserMetadata();

			if (!updatePasswordError && !updateMetadataError) {
				setMessage({
					text: "Profile updated successfully!",
					type: FormMessageTypes.Success,
				});

				updateUserStore();

				if (
					userData.aiProvider === "ollama" &&
					userData.aiUrl !== originalAiUrl
				) {
					await refreshModels("ollama");
					setOriginalAiUrl(userData.aiUrl ?? "");
				}

				setTimeout(() => {
					onClose();
				}, modalCloseDelay);
			}
		} catch (_catchError) {
			setMessage({
				text: "An error occurred while updating profile",
				type: FormMessageTypes.Error,
			});
		}

		resetStateData();
		setLoading(false);
	};

	const handleClose = (): void => {
		resetMessages();
		resetStateData();

		if (originalTheme && userData.theme !== originalTheme) {
			document.documentElement.dataset.theme = originalTheme;
			setCookie(themeCookieName, originalTheme);
			useUserStore.getState().setTheme(originalTheme);
		}

		onClose();
	};

	// Load user data when modal opens
	useEffect(() => {
		const loadUserData = async () => {
			if (!isOpen) {
				return;
			}

			try {
				resetMessages();
				resetStateData();
				const userEmail = await getUserEmailBySession();

				if (userEmail) {
					const username = userEmail?.split("@")[0] || "";

					setUserData((prev) => ({
						...prev,
						email: userEmail,
						username,
					}));
				}

				const dataFromSession = await getUserDataFromSession();
				const userMetadata = dataFromSession?.user?.user_metadata;

				if (userMetadata) {
					setUserData((prev) => ({
						...prev,
						username: userMetadata?.username ?? prev.username,
						avatar: userMetadata?.avatar ?? prev.avatar,
					}));
				}

				if (userMetadata?.theme && isValidTheme(userMetadata.theme)) {
					setUserData((prev) => ({
						...prev,
						theme: userMetadata.theme,
					}));
					setOriginalTheme(userMetadata.theme);
				}

				if (userMetadata?.auto_save !== undefined) {
					setUserData((prev) => ({
						...prev,
						autoSave: userMetadata.auto_save,
					}));
				}

				if (userMetadata?.ai_provider) {
					setUserData((prev) => ({
						...prev,
						aiProvider: userMetadata.ai_provider,
					}));
				}

				if (userMetadata?.ai_api_key) {
					setUserData((prev) => ({
						...prev,
						aiApiKey: userMetadata.ai_api_key,
					}));
				}

				if (userMetadata?.ai_model) {
					setUserData((prev) => ({
						...prev,
						aiModel: userMetadata.ai_model,
					}));
				}

				if (userMetadata?.ai_url) {
					setUserData((prev) => ({
						...prev,
						aiUrl: userMetadata.ai_url,
					}));
					setOriginalAiUrl(userMetadata.ai_url);
				}

				const activeProvider: AiProvider =
					userMetadata?.ai_provider ?? "ollama";
				const { models } = await fetchAiModels(activeProvider, {
					apiKey:
						activeProvider !== "ollama" ? userMetadata?.ai_api_key : undefined,
					ollamaUrl:
						activeProvider === "ollama" ? userMetadata?.ai_url : undefined,
					ollamaApiKey:
						activeProvider === "ollama" ? userMetadata?.ai_api_key : undefined,
				});

				setAiModels(models);
			} catch (_catchError) {
				setMessage({
					text: "Error loading user data",
					type: FormMessageTypes.Error,
				});
			}
		};

		loadUserData();
	}, [isOpen]);

	const modelDropdown = (): ReactElement => {
		if (modelsLoading) {
			return (
				<div className={styles.modelLoadGroup}>
					<Loading width={16} height={16} />
					<small className={styles.helpText}>Loading models...</small>
				</div>
			);
		}

		if (aiModels.length > 0) {
			return (
				<select
					className={styles.modelSelect}
					value={userData.aiModel ?? ""}
					onChange={(event) =>
						setUserData((prev) => ({
							...prev,
							aiModel: event.target.value,
						}))
					}
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
					onClick={() => refreshModels()}
				>
					Load Models
				</button>
			</div>
		);
	};

	const profileTab = (
		<>
			{/* Avatar Selection */}
			<div className={styles.section}>
				<h3 className={styles.sectionTitle}>Profile Picture</h3>
				<div className={styles.avatarContainer}>
					<div className={styles.currentAvatar}>
						<img
							src={userData.avatar}
							alt="Current avatar"
							className={styles.avatarPreview}
						/>
					</div>
					<div className={styles.avatarOptions}>
						{avatarOptions.map((avatar, index) => (
							<button
								key={index}
								type="button"
								className={`${styles.avatarOption} ${
									userData.avatar === avatar ? styles.avatarSelected : ""
								}`}
								onClick={() => handleAvatarChange(avatar)}
							>
								<img src={avatar} alt={`Avatar option ${index + 1}`} />
							</button>
						))}
					</div>
				</div>
			</div>

			{/* User Information */}
			<div className={styles.section}>
				<h3 className={styles.sectionTitle}>User Information</h3>
				<div className={styles.inputGroup}>
					<div className={styles.emailText}>
						<Envelope width={22} height={22} />
						{userData.email}
					</div>
					<small className={styles.helpText}>Email cannot be changed</small>
				</div>

				<div className={styles.inputGroup}>
					<span className={styles.label}>Username</span>
					<Input
						type="text"
						name="username"
						placeholder="Username"
						fat
						value={userData.username}
						onChange={(event: ChangeEvent<HTMLInputElement>) =>
							handleInputChange(event, "username")
						}
						disabled={isUserEmailDemo(userData?.email ?? "")}
						disableMargin
						className={styles.input}
						required
						max={15}
						maxLength={15}
					/>
				</div>
			</div>

			{/* Password Change */}
			<div className={styles.section}>
				<h3 className={styles.sectionTitle}>Change Password</h3>
				<div className={styles.inputGroup}>
					<Input
						type="password"
						name="newPassword"
						placeholder="New Password"
						fat
						value={userData.newPassword}
						onChange={(event: ChangeEvent<HTMLInputElement>) =>
							handleInputChange(event, "newPassword")
						}
						disabled={isUserEmailDemo(userData?.email ?? "")}
						disableMargin
						Icon={<Lock width={18} height={18} />}
						className={styles.input}
						max={25}
						maxLength={25}
					/>
				</div>

				<div className={styles.inputGroup}>
					<Input
						className={styles.input}
						type="password"
						name="confirmPassword"
						placeholder="Confirm New Password"
						fat
						value={userData.confirmPassword}
						onChange={(event: ChangeEvent<HTMLInputElement>) =>
							handleInputChange(event, "confirmPassword")
						}
						disabled={isUserEmailDemo(userData?.email ?? "")}
						disableMargin
						Icon={<Lock width={18} height={18} />}
						max={25}
						maxLength={25}
					/>
				</div>
				<small className={styles.helpText}>
					Leave empty to keep current password
				</small>
			</div>
		</>
	);

	const preferencesTab = (
		<>
			{/* Theme */}
			<div className={styles.section}>
				<h3 className={styles.sectionTitle}>Theme</h3>
				<ThemePreview
					activeTheme={userData.theme}
					onThemeChange={handleThemeChange}
				/>
			</div>

			{/* Editor Settings */}
			<div className={styles.section}>
				<h3 className={styles.sectionTitle}>Editor</h3>
				<div className={styles.toggleGroup}>
					<label className={styles.toggleLabel}>
						<input
							type="checkbox"
							checked={userData.autoSave ?? false}
							onChange={(event) =>
								setUserData((prev) => ({
									...prev,
									autoSave: event.target.checked,
								}))
							}
							className={styles.toggleCheckbox}
						/>
						<span className={styles.toggleText}>
							Auto-save on snippet switch
						</span>
					</label>
					<small className={styles.helpText}>
						Automatically save changes when switching to another snippet
					</small>
				</div>
			</div>
		</>
	);

	const aiTab = (
		<>
			{/* Provider Selection */}
			<div className={styles.section}>
				<h3 className={styles.sectionTitle}>Provider</h3>
				<div className={styles.inputGroup}>
					<span className={styles.label}>AI Provider</span>
					<select
						className={styles.modelSelect}
						value={userData.aiProvider ?? "ollama"}
						onChange={(event) =>
							handleProviderChange(event.target.value as AiProvider)
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

			{/* Configuration */}
			<div className={styles.section}>
				<h3 className={styles.sectionTitle}>
					{
						{
							ollama: "Ollama",
							claude: "Claude (Anthropic)",
							openai: "OpenAI",
						}[userData.aiProvider ?? "ollama"]
					}
				</h3>

				{/* Endpoint URL — Ollama only */}
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
								handleInputChange(event, "aiUrl")
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

				{/* API Key */}
				<div className={styles.inputGroup}>
					<span className={styles.label}>API Key</span>
					<Input
						type="password"
						name="aiApiKey"
						placeholder={
							userData.aiProvider === "claude"
								? "sk-ant-..."
								: userData.aiProvider === "openai"
									? "sk-..."
									: "ollama-api-key..."
						}
						fat
						value={userData.aiApiKey ?? ""}
						onChange={(event: ChangeEvent<HTMLInputElement>) =>
							handleInputChange(event, "aiApiKey")
						}
						disableMargin
						Icon={<Lock width={18} height={18} />}
						className={styles.input}
						maxLength={255}
					/>
					<small className={styles.helpText}>
						{userData.aiProvider === "claude" &&
							"Get your API key at console.anthropic.com"}
						{userData.aiProvider === "openai" &&
							"Get your API key at platform.openai.com/api-keys"}
						{userData.aiProvider === "ollama" &&
							"Required only for ollama.com cloud models"}
					</small>
				</div>

				{/* Model */}
				<div className={styles.inputGroup}>
					<span className={styles.label}>Model</span>
					{modelDropdown()}
				</div>
			</div>
		</>
	);

	const tabItems = [
		{ value: "profile", label: "Profile", content: profileTab },
		{ value: "preferences", label: "Preferences", content: preferencesTab },
		{ value: "ai", label: "AI", content: aiTab },
	];

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			title="Account Settings"
			className={styles.accountModal}
		>
			<div className={styles.container}>
				<form onSubmit={handleSubmit} className={styles.form}>
					<Tabs items={tabItems} defaultValue="profile" />

					{/* Message */}
					{message.text && (
						<Alert
							severity={
								message.type === FormMessageTypes.Error
									? FormMessageTypes.Error
									: FormMessageTypes.Success
							}
							className={styles.alert}
						>
							{message.text}
						</Alert>
					)}

					{/* Submit Button */}
					<div className={styles.buttonContainer}>
						<Button
							type="submit"
							disabled={loading || isUserEmailDemo(userData.email ?? "")}
							className={styles.submitButton}
						>
							{loading ? <Loading width={20} height={20} /> : "Update Profile"}
						</Button>
						<Button
							type="button"
							variant="secondary"
							onClick={handleClose}
							disabled={loading}
							className={styles.cancelButton}
						>
							Cancel
						</Button>
					</div>
				</form>
			</div>
		</Modal>
	);
};

export default AccountModal;
