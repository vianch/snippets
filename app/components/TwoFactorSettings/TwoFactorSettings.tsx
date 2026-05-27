import { ReactElement, useState, useEffect, ChangeEvent } from "react";

/* Lib */
import { FormMessageTypes } from "@/lib/constants/form";
import { MfaCodeLength, TwoFactorMode } from "@/lib/constants/mfa";
import {
	challengeAndVerifyMfaFactor,
	cleanupUnverifiedTotpFactors,
	enrollTotpFactor,
	getVerifiedTotpFactorId,
	isMfaEnabled,
	unenrollMfaFactor,
} from "@/lib/supabase/queries";

/* Components */
import Input from "@/components/ui/Input/Input";
import Button from "@/components/ui/Button/Button";
import Alert from "@/components/ui/Alert/Alert";
import Loading from "@/components/ui/icons/Loading";
import Lock from "@/components/ui/icons/Lock";

/* Utils */
import { formatRecoveryCode, requestRecoveryCodes } from "@/utils/mfa.utils";

/* Styles */
import styles from "./twoFactorSettings.module.css";

interface TwoFactorSettingsProps {
	disabled?: boolean;
}

const TwoFactorSettings = ({
	disabled = false,
}: TwoFactorSettingsProps): ReactElement => {
	const [initializing, setInitializing] = useState(true);
	const [loading, setLoading] = useState(false);
	const [mode, setMode] = useState<TwoFactorMode>(TwoFactorMode.Disabled);
	const [enrollment, setEnrollment] = useState<TotpEnrollment | null>(null);
	const [code, setCode] = useState("");
	const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
	const [acknowledged, setAcknowledged] = useState(false);
	const [message, setMessage] = useState<{
		text: string;
		type: FormMessageTypes;
	}>({ text: "", type: FormMessageTypes.Unset });

	const resetMessage = (): void => {
		setMessage({ text: "", type: FormMessageTypes.Unset });
	};

	useEffect(() => {
		let isMounted = true;

		const loadState = async (): Promise<void> => {
			const enabled = await isMfaEnabled();

			if (!isMounted) {
				return;
			}

			setMode(enabled ? TwoFactorMode.Enabled : TwoFactorMode.Disabled);
			setInitializing(false);
		};

		loadState();

		return () => {
			isMounted = false;
		};
	}, []);

	const startEnrollment = async (): Promise<void> => {
		setLoading(true);
		resetMessage();
		await cleanupUnverifiedTotpFactors();

		const { enrollment: newEnrollment, error } = await enrollTotpFactor();

		if (error || !newEnrollment) {
			setMessage({
				text: error ?? "Could not start enrollment",
				type: FormMessageTypes.Error,
			});
			setLoading(false);

			return;
		}

		setEnrollment(newEnrollment);
		setMode(TwoFactorMode.Enrolling);
		setCode("");
		setLoading(false);
	};

	const cancelEnrollment = async (): Promise<void> => {
		setLoading(true);

		if (enrollment) {
			await unenrollMfaFactor(enrollment.factorId);
		}

		setEnrollment(null);
		setCode("");
		setMode(TwoFactorMode.Disabled);
		resetMessage();
		setLoading(false);
	};

	const confirmEnrollment = async (): Promise<void> => {
		if (!enrollment || code.length !== MfaCodeLength) {
			setMessage({
				text: `Enter the ${MfaCodeLength}-digit code from your authenticator app`,
				type: FormMessageTypes.Warning,
			});

			return;
		}

		setLoading(true);
		const { error } = await challengeAndVerifyMfaFactor(
			enrollment.factorId,
			code
		);

		if (error) {
			setMessage({
				text: "Invalid or expired code, please try again",
				type: FormMessageTypes.Error,
			});
			setCode("");
			setLoading(false);

			return;
		}

		setEnrollment(null);
		setCode("");

		const { codes, error: codesError } = await requestRecoveryCodes();

		if (codesError || codes.length === 0) {
			setMode(TwoFactorMode.Enabled);
			setMessage({
				text: "Two-factor authentication enabled. Recovery codes could not be generated — regenerate them from this screen.",
				type: FormMessageTypes.Warning,
			});
			setLoading(false);

			return;
		}

		setRecoveryCodes(codes);
		setAcknowledged(false);
		setMode(TwoFactorMode.RecoveryCodes);
		setMessage({
			text: "Two-factor authentication enabled",
			type: FormMessageTypes.Success,
		});
		setLoading(false);
	};

	const regenerateRecoveryCodes = async (): Promise<void> => {
		setLoading(true);
		resetMessage();

		const { codes, error } = await requestRecoveryCodes();

		if (error || codes.length === 0) {
			setMessage({
				text: error ?? "Could not generate recovery codes",
				type: FormMessageTypes.Error,
			});
			setLoading(false);

			return;
		}

		setRecoveryCodes(codes);
		setAcknowledged(false);
		setMode(TwoFactorMode.RecoveryCodes);
		setLoading(false);
	};

	const finishRecoveryCodes = (): void => {
		setRecoveryCodes([]);
		setAcknowledged(false);
		setMode(TwoFactorMode.Enabled);
		resetMessage();
	};

	const handleCopyRecoveryCodes = async (): Promise<void> => {
		await navigator.clipboard.writeText(
			recoveryCodes.map(formatRecoveryCode).join("\n")
		);
		setMessage({
			text: "Recovery codes copied to clipboard",
			type: FormMessageTypes.Success,
		});
	};

	const handleDownloadRecoveryCodes = (): void => {
		const content = recoveryCodes.map(formatRecoveryCode).join("\n");
		const blob = new Blob([content], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const anchor = document.createElement("a");

		anchor.href = url;
		anchor.download = "snippets-recovery-codes.txt";
		anchor.click();
		URL.revokeObjectURL(url);
	};

	const confirmDisable = async (): Promise<void> => {
		if (code.length !== MfaCodeLength) {
			setMessage({
				text: `Enter the ${MfaCodeLength}-digit code to disable two-factor authentication`,
				type: FormMessageTypes.Warning,
			});

			return;
		}

		setLoading(true);
		const factorId = await getVerifiedTotpFactorId();

		if (!factorId) {
			setMode(TwoFactorMode.Disabled);
			setLoading(false);

			return;
		}

		const { error: verifyError } = await challengeAndVerifyMfaFactor(
			factorId,
			code
		);

		if (verifyError) {
			setMessage({
				text: "Invalid or expired code, please try again",
				type: FormMessageTypes.Error,
			});
			setCode("");
			setLoading(false);

			return;
		}

		const { error: unenrollError } = await unenrollMfaFactor(factorId);

		if (unenrollError) {
			setMessage({ text: unenrollError, type: FormMessageTypes.Error });
			setLoading(false);

			return;
		}

		setCode("");
		setMode(TwoFactorMode.Disabled);
		setMessage({
			text: "Two-factor authentication disabled",
			type: FormMessageTypes.Success,
		});
		setLoading(false);
	};

	const handleToggle = (): void => {
		resetMessage();

		if (mode === TwoFactorMode.Disabled) {
			startEnrollment();

			return;
		}

		if (mode === TwoFactorMode.Enrolling) {
			cancelEnrollment();

			return;
		}

		if (mode === TwoFactorMode.RecoveryCodes) {
			return;
		}

		if (mode === TwoFactorMode.Enabled) {
			setCode("");
			setMode(TwoFactorMode.Disabling);

			return;
		}

		setCode("");
		setMode(TwoFactorMode.Enabled);
	};

	const handleCodeChange = (event: ChangeEvent<HTMLInputElement>): void => {
		const digitsOnly = (event.target.value ?? "")
			.replace(/\D/g, "")
			.slice(0, MfaCodeLength);

		setCode(digitsOnly);
		resetMessage();
	};

	const isToggleChecked =
		mode === TwoFactorMode.Enabled ||
		mode === TwoFactorMode.Enrolling ||
		mode === TwoFactorMode.RecoveryCodes;

	return (
		<div className={styles.section}>
			<h3 className={styles.sectionTitle}>Two-Factor Authentication</h3>

			<div className={styles.toggleGroup}>
				<label className={styles.toggleLabel}>
					<input
						type="checkbox"
						checked={isToggleChecked}
						onChange={handleToggle}
						disabled={disabled || loading || initializing}
						className={styles.toggleCheckbox}
					/>
					<span className={styles.toggleText}>
						{isToggleChecked
							? "Two-factor authentication is on"
							: "Enable two-factor authentication"}
					</span>
					{(loading || initializing) && <Loading width={16} height={16} />}
				</label>
				<small className={styles.helpText}>
					Protect your account with a time-based code from an authenticator app.
				</small>
			</div>

			{mode === TwoFactorMode.Enrolling && enrollment && (
				<div className={styles.enrollment}>
					<ol className={styles.steps}>
						<li>
							Open your authenticator app (Google Authenticator, 1Password,
							Authy…).
						</li>
						<li>Scan the QR code below, or enter the setup key manually.</li>
						<li>Enter the 6-digit code the app generates to confirm.</li>
					</ol>

					<div className={styles.qrContainer}>
						<img
							className={styles.qrImage}
							src={enrollment.qrCode}
							alt="Two-factor authentication QR code"
						/>
					</div>

					<div className={styles.secretGroup}>
						<span className={styles.label}>Setup key</span>
						<code className={styles.secret}>{enrollment.secret}</code>
					</div>

					<Input
						type="text"
						placeholder="6-digit code"
						fat
						value={code}
						maxLength={MfaCodeLength}
						Icon={<Lock width={18} height={18} />}
						onChange={handleCodeChange}
						disableMargin
						className={styles.input}
					/>

					<div className={styles.actions}>
						<Button
							type="button"
							onClick={confirmEnrollment}
							disabled={loading}
						>
							{loading ? <Loading width={18} height={18} /> : "Verify & enable"}
						</Button>
						<Button
							type="button"
							variant="secondary"
							onClick={cancelEnrollment}
							disabled={loading}
						>
							Cancel
						</Button>
					</div>
				</div>
			)}

			{mode === TwoFactorMode.Disabling && (
				<div className={styles.enrollment}>
					<small className={styles.helpText}>
						Enter a current code from your authenticator app to turn off
						two-factor authentication.
					</small>

					<Input
						type="text"
						placeholder="6-digit code"
						fat
						value={code}
						maxLength={MfaCodeLength}
						Icon={<Lock width={18} height={18} />}
						onChange={handleCodeChange}
						disableMargin
						className={styles.input}
					/>

					<div className={styles.actions}>
						<Button type="button" onClick={confirmDisable} disabled={loading}>
							{loading ? (
								<Loading width={18} height={18} />
							) : (
								"Confirm & disable"
							)}
						</Button>
						<Button
							type="button"
							variant="secondary"
							onClick={handleToggle}
							disabled={loading}
						>
							Cancel
						</Button>
					</div>
				</div>
			)}

			{mode === TwoFactorMode.Enabled && (
				<div className={styles.actions}>
					<Button
						type="button"
						variant="secondary"
						onClick={regenerateRecoveryCodes}
						disabled={disabled || loading}
					>
						{loading ? (
							<Loading width={18} height={18} />
						) : (
							"Regenerate recovery codes"
						)}
					</Button>
				</div>
			)}

			{mode === TwoFactorMode.RecoveryCodes && (
				<div className={styles.enrollment}>
					<small className={styles.helpText}>
						Save these recovery codes somewhere safe. Each code works once and
						lets you sign in if you lose access to your authenticator app. They
						will not be shown again.
					</small>

					<ul className={styles.recoveryCodes}>
						{recoveryCodes.map((recoveryCode) => (
							<li key={recoveryCode} className={styles.recoveryCode}>
								{formatRecoveryCode(recoveryCode)}
							</li>
						))}
					</ul>

					<div className={styles.actions}>
						<Button
							type="button"
							variant="secondary"
							onClick={handleCopyRecoveryCodes}
						>
							Copy
						</Button>
						<Button
							type="button"
							variant="secondary"
							onClick={handleDownloadRecoveryCodes}
						>
							Download
						</Button>
					</div>

					<label className={styles.toggleLabel}>
						<input
							type="checkbox"
							checked={acknowledged}
							onChange={(event) => setAcknowledged(event.target.checked)}
							className={styles.toggleCheckbox}
						/>
						<span className={styles.toggleText}>
							I have saved my recovery codes
						</span>
					</label>

					<div className={styles.actions}>
						<Button
							type="button"
							onClick={finishRecoveryCodes}
							disabled={!acknowledged}
						>
							Done
						</Button>
					</div>
				</div>
			)}

			{message.text && (
				<Alert
					severity={
						message.type === FormMessageTypes.Error
							? FormMessageTypes.Error
							: message.type === FormMessageTypes.Warning
								? FormMessageTypes.Warning
								: FormMessageTypes.Success
					}
				>
					{message.text}
				</Alert>
			)}
		</div>
	);
};

export default TwoFactorSettings;
