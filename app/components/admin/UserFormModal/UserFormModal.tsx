"use client";

import { ReactElement, useEffect, useState } from "react";

/* Constants */
import { AdminFormMode } from "@/lib/constants/admin.constants";
import { AppRole } from "@/lib/constants/roles";
import { ThemeNames, themeList } from "@/lib/config/themes";

/* Components */
import Alert from "@/components/ui/Alert/Alert";
import Button from "@/components/ui/Button/Button";
import Input from "@/components/ui/Input/Input";
import Modal from "@/components/ui/Modal/Modal";
import Select from "@/components/ui/Select/Select";
import Switch from "@/components/ui/Switch/Switch";
import Envelope from "@/components/ui/icons/Envelope";
import Lock from "@/components/ui/icons/Lock";
import User from "@/components/ui/icons/User";

/* Styles */
import styles from "./userFormModal.module.css";

type UserFormModalProps = {
	errorMessage: string | null;
	isOpen: boolean;
	isSubmitting: boolean;
	mode: AdminFormMode;
	onClose: () => void;
	onSubmit: (values: AdminUserFormValues) => void;
	user: AdminUser | null;
};

const UserFormModal = ({
	errorMessage,
	isOpen,
	isSubmitting,
	mode,
	onClose,
	onSubmit,
	user,
}: UserFormModalProps): ReactElement => {
	const isEdit = mode === AdminFormMode.Edit;
	const [email, setEmail] = useState<string>("");
	const [username, setUsername] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [role, setRole] = useState<AppRole>(AppRole.User);
	const [theme, setTheme] = useState<string>(ThemeNames.ShadesOfPurple);
	const [isDisabled, setIsDisabled] = useState<boolean>(false);

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		setEmail(user?.email ?? "");
		setUsername(user?.username ?? "");
		setPassword("");
		setRole(user?.role ?? AppRole.User);
		setTheme(user?.theme ?? ThemeNames.ShadesOfPurple);
		setIsDisabled(user?.isDisabled ?? false);
	}, [isOpen, user]);

	const roleOptions: { label: string; value: AppRole }[] = [
		{ label: "Admin", value: AppRole.Admin },
		{ label: "User", value: AppRole.User },
	];
	const roleLabel =
		roleOptions.find((option) => option.value === role)?.label ?? "User";
	const themeLabel =
		themeList.find((option) => option.name === theme)?.label ?? theme;

	const handleRoleSelect = (label: string): void => {
		const match = roleOptions.find((option) => option.label === label);

		setRole(match?.value ?? AppRole.User);
	};

	const handleThemeSelect = (label: string): void => {
		const match = themeList.find((option) => option.label === label);

		setTheme(match?.name ?? ThemeNames.ShadesOfPurple);
	};

	const handleSubmit = (): void => {
		onSubmit({ email, isDisabled, password, role, theme, username });
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={isEdit ? "Edit user" : "Create user"}
			className={styles.userModal}
		>
			<div className={styles.container}>
				<div className={styles.form}>
					<div className={styles.section}>
						<h3 className={styles.sectionTitle}>User information</h3>

						<div className={styles.inputGroup}>
							<span className={styles.label}>Email</span>
							<Input
								type="email"
								value={email}
								maxLength={120}
								placeholder="name@example.com"
								fat
								disableMargin
								Icon={<Envelope width={16} height={16} />}
								className={styles.input}
								onChange={(event) => setEmail(event.target.value)}
							/>
						</div>

						<div className={styles.inputGroup}>
							<span className={styles.label}>Username</span>
							<Input
								type="text"
								value={username}
								maxLength={60}
								placeholder="Display name"
								fat
								disableMargin
								Icon={<User width={16} height={16} />}
								className={styles.input}
								onChange={(event) => setUsername(event.target.value)}
							/>
						</div>

						{!isEdit && (
							<div className={styles.inputGroup}>
								<span className={styles.label}>Password</span>
								<Input
									type="password"
									value={password}
									maxLength={72}
									placeholder="Temporary password"
									fat
									disableMargin
									Icon={<Lock width={16} height={16} />}
									className={styles.input}
									onChange={(event) => setPassword(event.target.value)}
								/>
							</div>
						)}
					</div>

					<div className={styles.section}>
						<h3 className={styles.sectionTitle}>Role &amp; theme</h3>

						<div className={styles.row}>
							<div className={styles.inputGroup}>
								<span className={styles.label}>Role</span>
								<Select
									value={roleLabel}
									items={roleOptions.map((option) => option.label)}
									onSelect={handleRoleSelect}
								/>
							</div>

							<div className={styles.inputGroup}>
								<span className={styles.label}>Theme</span>
								<Select
									value={themeLabel}
									items={themeList.map((option) => option.label)}
									onSelect={handleThemeSelect}
								/>
							</div>
						</div>
					</div>

					{isEdit && (
						<div className={styles.section}>
							<h3 className={styles.sectionTitle}>Status</h3>
							<Switch
								checked={!isDisabled}
								label="Account enabled"
								description="Disabled users cannot sign in."
								onChange={(checked) => setIsDisabled(!checked)}
							/>
						</div>
					)}

					{errorMessage && (
						<Alert severity="error" className={styles.alert}>
							{errorMessage}
						</Alert>
					)}

					<div className={styles.buttonContainer}>
						<Button variant="secondary" onClick={onClose}>
							Cancel
						</Button>
						<Button
							variant="secondary"
							onClick={handleSubmit}
							disabled={isSubmitting}
						>
							{isSubmitting
								? "Saving…"
								: isEdit
									? "Save changes"
									: "Create user"}
						</Button>
					</div>
				</div>
			</div>
		</Modal>
	);
};

export default UserFormModal;
