"use client";

import { ChangeEvent, FormEvent, ReactElement, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/* Lib */
import { MinPasswordLength } from "@/lib/constants/admin.constants";
import {
	RecoveryOtpType,
	RecoveryTokenHashParam,
	ResetPasswordStep,
} from "@/lib/constants/auth.constants";
import { FormMessageTypes } from "@/lib/constants/form";
import supabase from "@/lib/supabase/client";

/* Components */
import Alert from "@/components/ui/Alert/Alert";
import Button from "@/components/ui/Button/Button";
import Input from "@/components/ui/Input/Input";
import EyeClosed from "@/components/ui/icons/EyeClosed";
import EyeOpen from "@/components/ui/icons/EyeOpen";
import Loading from "@/components/ui/icons/Loading";
import Lock from "@/components/ui/icons/Lock";

/* Styles */
import styles from "./resetPasswordForm.module.css";

const ResetPasswordForm = (): ReactElement => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const tokenHash = searchParams.get(RecoveryTokenHashParam);
	const [step, setStep] = useState<ResetPasswordStep>(ResetPasswordStep.Form);
	const [password, setPassword] = useState<string>("");
	const [confirmPassword, setConfirmPassword] = useState<string>("");
	const [showPassword, setShowPassword] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);
	const [message, setMessage] = useState<{
		text: string;
		type: FormMessageTypes;
	}>({ text: "", type: FormMessageTypes.Unset });

	const togglePasswordVisibility = (): void => {
		setShowPassword((previous) => !previous);
	};

	const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>): void => {
		setPassword(event.target.value ?? "");
		setMessage({ text: "", type: FormMessageTypes.Unset });
	};

	const handleConfirmChange = (event: ChangeEvent<HTMLInputElement>): void => {
		setConfirmPassword(event.target.value ?? "");
		setMessage({ text: "", type: FormMessageTypes.Unset });
	};

	const handleGoToLogin = (): void => {
		router.push("/login");
	};

	const handleSubmit = async (
		event: FormEvent<HTMLFormElement>
	): Promise<void> => {
		event.preventDefault();

		if (!tokenHash) {
			setMessage({
				text: "This recovery link is missing its token. Ask an administrator to generate a new one.",
				type: FormMessageTypes.Error,
			});

			return;
		}

		if (password.length < MinPasswordLength) {
			setMessage({
				text: `Password must be at least ${MinPasswordLength} characters`,
				type: FormMessageTypes.Warning,
			});

			return;
		}

		if (password !== confirmPassword) {
			setMessage({
				text: "Passwords do not match",
				type: FormMessageTypes.Warning,
			});

			return;
		}

		setLoading(true);

		// Redeem the one-time recovery token only now, on submit, so that simply
		// opening or reloading the link never burns it. verifyOtp establishes the
		// target user's recovery session, replacing whatever session was active.
		const { error: verifyError } = await supabase.auth.verifyOtp({
			token_hash: tokenHash,
			type: RecoveryOtpType,
		});

		if (verifyError) {
			setMessage({
				text:
					verifyError.message || "This recovery link is invalid or has expired",
				type: FormMessageTypes.Error,
			});
			setLoading(false);

			return;
		}

		const { error: updateError } = await supabase.auth.updateUser({
			password,
		});

		if (updateError) {
			setMessage({
				text: updateError.message || "Could not update password, try again",
				type: FormMessageTypes.Error,
			});
			setLoading(false);

			return;
		}

		// Clear the recovery session so the user signs in cleanly with the new
		// password (and the admin who opened the link isn't left signed in as them).
		await supabase.auth.signOut();
		setLoading(false);
		setStep(ResetPasswordStep.Done);
	};

	const passwordToggleIcon = showPassword ? (
		<EyeOpen width={20} height={20} onClick={togglePasswordVisibility} />
	) : (
		<EyeClosed width={20} height={20} onClick={togglePasswordVisibility} />
	);

	if (!tokenHash) {
		return (
			<div className={styles.form}>
				<Alert severity={FormMessageTypes.Error}>
					This recovery link is invalid or has expired. Ask an administrator to
					generate a new one.
				</Alert>

				<Button
					className={styles.button}
					variant="secondary"
					type="button"
					onClick={handleGoToLogin}
				>
					<span>Back to login</span>
				</Button>
			</div>
		);
	}

	if (step === ResetPasswordStep.Done) {
		return (
			<div className={styles.form}>
				<Alert severity={FormMessageTypes.Success}>
					Your password has been updated. You can now sign in with your new
					password.
				</Alert>

				<Button
					className={styles.button}
					variant="secondary"
					type="button"
					onClick={handleGoToLogin}
				>
					<span>Continue to login</span>
				</Button>
			</div>
		);
	}

	return (
		<form className={styles.form} onSubmit={handleSubmit}>
			{message.type !== FormMessageTypes.Unset && (
				<Alert severity={message.type}>{message.text}</Alert>
			)}

			<Input
				className="inputField"
				fat
				dark={false}
				type={showPassword ? "text" : "password"}
				placeholder="New password"
				Icon={<Lock width={24} height={24} />}
				SuffixIcon={passwordToggleIcon}
				value={password}
				required={true}
				onChange={handlePasswordChange}
			/>

			<Input
				className="inputField"
				fat
				dark={false}
				type={showPassword ? "text" : "password"}
				placeholder="Confirm new password"
				Icon={<Lock width={24} height={24} />}
				value={confirmPassword}
				required={true}
				onChange={handleConfirmChange}
			/>

			<Button className={styles.button} disabled={loading} variant="secondary">
				{loading ? (
					<Loading width={24} height={24} />
				) : (
					<span>Update password</span>
				)}
			</Button>
		</form>
	);
};

export default ResetPasswordForm;
