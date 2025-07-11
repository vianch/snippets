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

/* Store */
import useUserStore from "@/lib/store/user.store";

/* Utils */
import { isUserEmailDemo } from "@/utils/account.utils";

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
		// Check if username or avatar has actually changed
		const { hasUserNameChanged, hasUserAvatarChanged } =
			checkForUserDataChanges();

		// Only make API call if there are actual changes
		if (!hasUserNameChanged && !hasUserAvatarChanged) {
			return null; // No changes, no need to update
		}

		const { error: updateError } = await updateUser({
			data: {
				username: userData.username,
				avatar: userData.avatar,
			},
		});

		if (updateError) {
			setMessage({ text: updateError.message, type: FormMessageTypes.Error });

			return updateError;
		}

		return null;
	};

	const updateUserStore = (): void => {
		// Only update the store if username or avatar has actually changed
		const { hasUserNameChanged, hasUserAvatarChanged } =
			checkForUserDataChanges();

		if (hasUserNameChanged || hasUserAvatarChanged) {
			setStoreUserData({
				userName: userData.username,
				userAvatar: userData.avatar,
				email: userData.email,
			});
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

				// Close modal after successful update
				setTimeout(() => {
					onClose();
				}, modalCloseDelay);
			}
		} catch (catchError) {
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
			} catch (catchError) {
				// Handle error silently or use a proper error handling mechanism
				setMessage({
					text: "Error loading user data",
					type: FormMessageTypes.Error,
				});
			}
		};

		loadUserData();
	}, [isOpen]);

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			title="Account Settings"
			className={styles.accountModal}
		>
			<div className={styles.container}>
				<form onSubmit={handleSubmit} className={styles.form}>
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
