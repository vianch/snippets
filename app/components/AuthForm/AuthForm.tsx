"use client";

import {
	ReactElement,
	useState,
	FormEvent,
	ChangeEvent,
	useEffect,
} from "react";
import { useRouter } from "next/navigation";

/* Lib */
import {
	BannedErrorFragment,
	DisabledUserMessage,
	FormMessageTypes,
	regexPatterns,
} from "@/lib/constants/form";
import { AuthFormStep, MfaCodeLength } from "@/lib/constants/mfa";
import supabase from "@/lib/supabase/client";
import {
	challengeAndVerifyMfaFactor,
	getVerifiedTotpFactorId,
	isMfaChallengeRequired,
} from "@/lib/supabase/queries";

/* Utils */
import { recoverWithRecoveryCode } from "@/utils/mfa.utils";

/* Components */
import Input from "@/components/ui/Input/Input";
import Button from "@/components/ui/Button/Button";
import Loading from "@/components/ui/icons/Loading";
import Envelope from "@/components/ui/icons/Envelope";
import Lock from "@/components/ui/icons/Lock";
import EyeOpen from "@/components/ui/icons/EyeOpen";
import EyeClosed from "@/components/ui/icons/EyeClosed";
import Alert from "@/components/ui/Alert/Alert";

/* Styles */
import styles from "./authform.module.css";

const AuthForm = (): ReactElement => {
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [submitted, setSubmitted] = useState(false);
	const [step, setStep] = useState<AuthFormStep>(AuthFormStep.Credentials);
	const [mfaCode, setMfaCode] = useState("");
	const [recoveryCode, setRecoveryCode] = useState("");
	const [useRecoveryCode, setUseRecoveryCode] = useState(false);
	const [formData, setFormData] = useState<{
		email: string;
		password: string;
		text: string;
		type: FormMessageTypes;
	}>({
		email: "",
		password: "",
		text: "",
		type: FormMessageTypes.Unset,
	});
	const router = useRouter();

	const handleLogin = async (): Promise<void> => {
		const isEmailValid = regexPatterns.email.test(formData.email);
		const isPasswordValid = regexPatterns.password.test(formData.password);

		if (!isEmailValid) {
			setFormData({
				...formData,
				text: "Invalid email",
				type: FormMessageTypes.Warning,
			});

			return;
		}

		if (!isPasswordValid) {
			setFormData({
				...formData,
				text: "Invalid password",
				type: FormMessageTypes.Warning,
			});

			return;
		}

		setLoading(true);
		const { error } = await supabase.auth.signInWithPassword({
			email: formData.email,
			password: formData.password,
		});

		if (error) {
			const rawMessage =
				error.message || "something went wrong!, try again later";
			const friendlyMessage = rawMessage
				.toLowerCase()
				.includes(BannedErrorFragment)
				? DisabledUserMessage
				: rawMessage;

			setFormData({
				...formData,
				text: friendlyMessage,
				type: FormMessageTypes.Error,
			});
			setLoading(false);

			return;
		}

		const mfaRequired = await isMfaChallengeRequired();

		if (mfaRequired) {
			setStep(AuthFormStep.MfaVerification);
			setFormData({
				...formData,
				text: "",
				type: FormMessageTypes.Unset,
			});
			setSubmitted(false);
			setLoading(false);

			return;
		}

		setFormData({
			...formData,
			text: "Login success",
			type: FormMessageTypes.Success,
		});
		router.push("/snippets");
	};

	const handleVerifyMfa = async (): Promise<void> => {
		if (mfaCode.length !== MfaCodeLength) {
			setFormData({
				...formData,
				text: `Enter the ${MfaCodeLength}-digit code from your authenticator app`,
				type: FormMessageTypes.Warning,
			});

			return;
		}

		setLoading(true);
		const factorId = await getVerifiedTotpFactorId();

		if (!factorId) {
			setFormData({
				...formData,
				text: "No authenticator is enrolled for this account",
				type: FormMessageTypes.Error,
			});
			setLoading(false);

			return;
		}

		const { error } = await challengeAndVerifyMfaFactor(factorId, mfaCode);

		if (error) {
			setFormData({
				...formData,
				text: "Invalid or expired code, please try again",
				type: FormMessageTypes.Error,
			});
			setMfaCode("");
			setLoading(false);

			return;
		}

		setFormData({
			...formData,
			text: "Login success",
			type: FormMessageTypes.Success,
		});
		router.push("/snippets");
	};

	const handleRecover = async (): Promise<void> => {
		if (recoveryCode.trim().length === 0) {
			setFormData({
				...formData,
				text: "Enter one of your recovery codes",
				type: FormMessageTypes.Warning,
			});

			return;
		}

		setLoading(true);
		const { success, error } = await recoverWithRecoveryCode(recoveryCode);

		if (!success) {
			setFormData({
				...formData,
				text: error ?? "Invalid recovery code",
				type: FormMessageTypes.Error,
			});
			setRecoveryCode("");
			setLoading(false);

			return;
		}

		// Removing a verified factor signs out every session, so the user must
		// sign in again — now with password only — and re-enroll two-factor auth.
		await supabase.auth.signOut();
		setStep(AuthFormStep.Credentials);
		setUseRecoveryCode(false);
		setRecoveryCode("");
		setMfaCode("");
		setFormData((previous) => ({
			...previous,
			password: "",
			text: "Two-factor authentication was removed. Sign in again and re-enable it.",
			type: FormMessageTypes.Info,
		}));
		setLoading(false);
	};

	const handleSubmit = async (
		event: FormEvent<HTMLFormElement>
	): Promise<void> => {
		event?.preventDefault();
		setSubmitted(true);

		if (step === AuthFormStep.MfaVerification) {
			if (useRecoveryCode) {
				await handleRecover();

				return;
			}

			await handleVerifyMfa();

			return;
		}

		await handleLogin();
	};

	const handleCancelMfa = async (): Promise<void> => {
		await supabase.auth.signOut();
		setStep(AuthFormStep.Credentials);
		setMfaCode("");
		setRecoveryCode("");
		setUseRecoveryCode(false);
		setSubmitted(false);
		setFormData((previous) => ({
			...previous,
			password: "",
			text: "",
			type: FormMessageTypes.Unset,
		}));
	};

	const toggleRecoveryMode = (): void => {
		setUseRecoveryCode((previous) => !previous);
		setMfaCode("");
		setRecoveryCode("");
		setSubmitted(false);
		setFormData((previous) => ({
			...previous,
			text: "",
			type: FormMessageTypes.Unset,
		}));
	};

	const handleRecoveryCodeChange = (
		event: ChangeEvent<HTMLInputElement>
	): void => {
		setRecoveryCode(event.target.value ?? "");
		setFormData((previous) => ({
			...previous,
			text: "",
			type: FormMessageTypes.Unset,
		}));
		setSubmitted(false);
	};

	const handleInputChange = (
		event: ChangeEvent<HTMLInputElement>,
		fieldType: "email" | "password" = "email"
	) => {
		const value = event.target.value ?? "";

		setFormData({
			...formData,
			[fieldType]: value,
			text: "",
			type: FormMessageTypes.Unset,
		});
		setSubmitted(false);
	};

	const handleMfaCodeChange = (event: ChangeEvent<HTMLInputElement>): void => {
		const digitsOnly = (event.target.value ?? "")
			.replace(/\D/g, "")
			.slice(0, MfaCodeLength);

		setMfaCode(digitsOnly);
		setFormData((previous) => ({
			...previous,
			text: "",
			type: FormMessageTypes.Unset,
		}));
		setSubmitted(false);
	};

	const togglePasswordVisibility = () => {
		setShowPassword((previous) => !previous);
	};

	useEffect(() => {
		return () => {
			setLoading(false);
		};
	}, []);

	const passwordToggleIcon = showPassword ? (
		<EyeOpen width={20} height={20} onClick={togglePasswordVisibility} />
	) : (
		<EyeClosed width={20} height={20} onClick={togglePasswordVisibility} />
	);

	return (
		<form className={styles.form} onSubmit={handleSubmit}>
			{submitted && formData.type !== FormMessageTypes.Unset && (
				<Alert severity={formData.type}>{formData.text}</Alert>
			)}

			{step === AuthFormStep.Credentials ? (
				<>
					<Input
						className="inputField"
						fat
						dark={false}
						type="email"
						placeholder="Email"
						Icon={<Envelope width={24} height={24} />}
						value={formData.email}
						required={true}
						onChange={handleInputChange}
					/>

					<Input
						className="inputField"
						fat
						dark={false}
						type={showPassword ? "text" : "password"}
						placeholder="Password"
						Icon={<Lock width={24} height={24} />}
						SuffixIcon={passwordToggleIcon}
						value={formData.password}
						required={true}
						onChange={(event) => handleInputChange(event, "password")}
					/>

					<Button
						className={styles.button}
						disabled={loading}
						variant="secondary"
					>
						{loading ? <Loading width={24} height={24} /> : <span>Log in</span>}
					</Button>
				</>
			) : (
				<>
					<p className={styles.mfaHelp}>
						{useRecoveryCode
							? "Enter one of your saved recovery codes to sign in. This removes two-factor authentication."
							: `Enter the ${MfaCodeLength}-digit code from your authenticator app to finish signing in.`}
					</p>

					{useRecoveryCode ? (
						<Input
							className="inputField"
							fat
							dark={false}
							type="text"
							placeholder="Recovery code"
							Icon={<Lock width={24} height={24} />}
							value={recoveryCode}
							required={true}
							maxLength={20}
							onChange={handleRecoveryCodeChange}
						/>
					) : (
						<Input
							className="inputField"
							fat
							dark={false}
							type="text"
							placeholder="Verification code"
							Icon={<Lock width={24} height={24} />}
							value={mfaCode}
							required={true}
							maxLength={MfaCodeLength}
							onChange={handleMfaCodeChange}
						/>
					)}

					<div className={styles.mfaActions}>
						<Button
							className={styles.mfaActionButton}
							disabled={loading}
							variant="secondary"
							type="button"
							onClick={handleCancelMfa}
						>
							<span>Cancel</span>
						</Button>

						<Button
							className={styles.mfaActionButton}
							disabled={loading}
							variant="secondary"
						>
							{loading ? (
								<Loading width={24} height={24} />
							) : (
								<span>Verify</span>
							)}
						</Button>
					</div>

					<button
						type="button"
						className={styles.linkButton}
						onClick={toggleRecoveryMode}
						disabled={loading}
					>
						{useRecoveryCode
							? "Use authenticator code instead"
							: "Can't access your authenticator? Use a recovery code"}
					</button>
				</>
			)}
		</form>
	);
};

export default AuthForm;
