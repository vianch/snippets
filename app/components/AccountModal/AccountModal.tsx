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
import { fetchOllamaModels } from "@/utils/ai.utils";

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
	const [ollamaModels, setOllamaModels] = useState<string[]>([]);
	const [originalOllamaUrl, setOriginalOllamaUrl] = useState<string>("");

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

	const checkForUserDataChanges = () => {
		const hasUserNameChanged = userData.username !== currentUserName;
		const hasUserAvatarChanged = userData.avatar !== currentUserAvatar;

		return { hasUserNameChanged, hasUserAvatarChanged };
	};

	const updatePassword = async (): Promise<Error | null> => {
		// Update password if provided
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

	const updateUserNameAndAvatar = async (): Promise<Error | null> => {
		// Check if username, avatar, or theme has actually changed
		const { hasUserNameChanged, hasUserAvatarChanged } =
			checkForUserDataChanges();
		const hasThemeChanged = userData.theme !== originalTheme;

		// Only make API call if there are actual changes (aiApiKey changes always trigger update)
		if (
			!hasUserNameChanged &&
			!hasUserAvatarChanged &&
			!hasThemeChanged &&
			!userData.aiApiKey
		) {
			return null; // No changes, no need to update
		}

		const updatePayload: Record<string, string | boolean | undefined> = {
			username: userData.username,
			avatar: userData.avatar,
			theme: userData.theme,
			auto_save: userData.autoSave ?? false,
		};

		if (userData.aiApiKey) {
			updatePayload.ai_api_key = userData.aiApiKey;
		}

		if (userData.ollamaModel !== undefined) {
			updatePayload.ollama_model = userData.ollamaModel;
		}

		if (userData.ollamaUrl !== undefined) {
			updatePayload.ollama_url = userData.ollamaUrl;
		}

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
		// Only update the store if username, avatar, or theme has actually changed
		const { hasUserNameChanged, hasUserAvatarChanged } =
			checkForUserDataChanges();
		const hasThemeChanged = userData.theme !== originalTheme;

		// Always sync autoSave to the store
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
		// Clear password fields
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
			const updateAvatarError = await updateUserNameAndAvatar();

			if (!updatePasswordError && !updateAvatarError) {
				setMessage({
					text: "Profile updated successfully!",
					type: FormMessageTypes.Success,
				});

				updateUserStore();

				// Refresh models if Ollama URL changed
				if (userData.ollamaUrl !== originalOllamaUrl) {
					await refreshModels();
					setOriginalOllamaUrl(userData.ollamaUrl ?? "");
				}

				// Close modal after successful update
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

	const refreshModels = async (): Promise<void> => {
		const models = await fetchOllamaModels(userData.ollamaUrl);

		setOllamaModels(models);
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

				// Get user metadata
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

				if (userMetadata?.ai_api_key) {
					setUserData((prev) => ({
						...prev,
						aiApiKey: userMetadata.ai_api_key,
					}));
				}

				if (userMetadata?.ollama_model) {
					setUserData((prev) => ({
						...prev,
						ollamaModel: userMetadata.ollama_model,
					}));
				}

				if (userMetadata?.ollama_url) {
					setUserData((prev) => ({
						...prev,
						ollamaUrl: userMetadata.ollama_url,
					}));
					setOriginalOllamaUrl(userMetadata.ollama_url);
				}

				// Fetch available Ollama models
				const models = await fetchOllamaModels(userMetadata?.ollama_url);

				setOllamaModels(models);
			} catch (_catchError) {
				// Handle error silently or use a proper error handling mechanism
				setMessage({
					text: "Error loading user data",
					type: FormMessageTypes.Error,
				});
			}
		};

		loadUserData();
	}, [isOpen]);

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
			{/* Ollama URL */}
			<div className={styles.section}>
				<h3 className={styles.sectionTitle}>Ollama</h3>
				<div className={styles.inputGroup}>
					<span className={styles.label}>Ollama URL</span>
					<Input
						type="text"
						name="ollamaUrl"
						placeholder="https://ollama.yourdomain.com"
						fat
						value={userData.ollamaUrl ?? ""}
						onChange={(event: ChangeEvent<HTMLInputElement>) =>
							handleInputChange(event, "ollamaUrl")
						}
						disableMargin
						className={styles.input}
						maxLength={200}
					/>
					<small className={styles.helpText}>
						Custom Ollama endpoint. Leave empty to use default. Models refresh
						after saving.
					</small>
				</div>

				<div className={styles.inputGroup}>
					<span className={styles.label}>Model</span>
					{ollamaModels.length > 0 ? (
						<select
							className={styles.modelSelect}
							value={userData.ollamaModel ?? ""}
							onChange={(event) =>
								setUserData((prev) => ({
									...prev,
									ollamaModel: event.target.value,
								}))
							}
						>
							<option value="">Use default (env var)</option>
							{ollamaModels.map((model) => (
								<option key={model} value={model}>
									{model}
								</option>
							))}
						</select>
					) : (
						<small className={styles.helpText}>
							No models available — check Ollama URL and save to refresh
						</small>
					)}
				</div>
			</div>

			{/* Claude API fallback */}
			<div className={styles.section}>
				<h3 className={styles.sectionTitle}>Claude API (fallback)</h3>
				<div className={styles.inputGroup}>
					<span className={styles.label}>Anthropic API Key</span>
					<Input
						type="password"
						name="aiApiKey"
						placeholder="sk-ant-..."
						fat
						value={userData.aiApiKey ?? ""}
						onChange={(event: ChangeEvent<HTMLInputElement>) =>
							handleInputChange(event, "aiApiKey")
						}
						disableMargin
						Icon={<Lock width={18} height={18} />}
						className={styles.input}
						maxLength={120}
					/>
					<small className={styles.helpText}>
						Used as fallback when Ollama is not available
					</small>
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
