"use client";

import { ChangeEvent, ReactElement, useEffect, useState } from "react";

/* Constants */
import { FormMessageTypes } from "@/lib/constants/form";
import {
	ExportFormat,
	ServerSideBackends,
	StorageApiBasePath,
	StorageBackend,
	StorageBackendFields,
	StorageBackendLabels,
	StorageBackendValues,
} from "@/lib/constants/storage.constants";

/* Lib */
import { resetActiveBackendCache } from "@/lib/storage/snippets";

/* Components */
import Alert from "@/components/ui/Alert/Alert";
import Button from "@/components/ui/Button/Button";
import Input from "@/components/ui/Input/Input";

/* Icons */
import Loading from "@/components/ui/icons/Loading";

/* Styles */
import styles from "./accountModal.module.css";

const DatabaseSettings = (): ReactElement => {
	const [backend, setBackend] = useState<StorageBackend>(
		StorageBackend.Supabase
	);
	const [connection, setConnection] = useState<StorageConnection>({});
	const [testResult, setTestResult] = useState<StorageTestResult | null>(null);
	const [secretConfigured, setSecretConfigured] = useState<boolean>(true);
	const [loading, setLoading] = useState<boolean>(true);
	const [testing, setTesting] = useState<boolean>(false);
	const [saving, setSaving] = useState<boolean>(false);
	const [message, setMessage] = useState<{
		text: string;
		type: FormMessageTypes;
	}>({ text: "", type: FormMessageTypes.Unset });

	useEffect(() => {
		let isMounted = true;

		const loadConfig = async (): Promise<void> => {
			const response = await fetch(`${StorageApiBasePath}/config`).catch(
				() => null
			);

			if (!isMounted) {
				return;
			}

			if (response?.ok) {
				const data = (await response.json()) as {
					backend: StorageBackend;
					connection: StorageConnection;
					secretConfigured: boolean;
				};

				setBackend(data.backend);
				setConnection(data.connection ?? {});
				setSecretConfigured(data.secretConfigured);
			}

			setLoading(false);
		};

		loadConfig();

		return () => {
			isMounted = false;
		};
	}, []);

	const requiresTest = ServerSideBackends.includes(backend);

	// Gate Save only on a passing connection test; if the server secret is
	// missing, let the Save click surface that error rather than disabling
	// silently (the note below already warns).
	const canSave = !requiresTest || Boolean(testResult?.ok);

	const handleBackendChange = (next: StorageBackend): void => {
		setBackend(next);
		setTestResult(null);
		setMessage({ text: "", type: FormMessageTypes.Unset });
	};

	const handleFieldChange = (
		key: keyof StorageConnection,
		rawValue: string,
		type: StorageFieldConfig["type"]
	): void => {
		const value = type === "number" ? Number(rawValue) : rawValue;

		setConnection((previous) => ({ ...previous, [key]: value }));
		setTestResult(null);
	};

	const handleTest = async (): Promise<void> => {
		setTesting(true);
		setMessage({ text: "", type: FormMessageTypes.Unset });

		const response = await fetch(`${StorageApiBasePath}/test`, {
			body: JSON.stringify({ backend, connection }),
			headers: { "Content-Type": "application/json" },
			method: "POST",
		}).catch(() => null);
		const result = (await response
			?.json()
			.catch(() => null)) as StorageTestResult | null;

		setTestResult(result ?? { error: "Test request failed", ok: false });
		setTesting(false);
	};

	const handleSave = async (): Promise<void> => {
		if (!canSave) {
			setMessage({
				text: "Test the connection successfully before saving.",
				type: FormMessageTypes.Error,
			});

			return;
		}

		setSaving(true);
		setMessage({ text: "", type: FormMessageTypes.Unset });

		const response = await fetch(`${StorageApiBasePath}/config`, {
			body: JSON.stringify({ backend, connection }),
			headers: { "Content-Type": "application/json" },
			method: "PUT",
		}).catch(() => null);

		if (response?.ok) {
			resetActiveBackendCache();
			setMessage({
				text: "Storage backend saved. It now applies to all users.",
				type: FormMessageTypes.Success,
			});
		} else {
			const data = (await response?.json().catch(() => null)) as {
				error?: string;
			} | null;

			setMessage({
				text: data?.error ?? "Failed to save storage config.",
				type: FormMessageTypes.Error,
			});
		}

		setSaving(false);
	};

	if (loading) {
		return (
			<div className={styles.section}>
				<Loading width={20} height={20} />
			</div>
		);
	}

	return (
		<>
			<div className={styles.section}>
				<h3 className={styles.sectionTitle}>Snippet storage backend</h3>
				<p className={styles.helpText}>
					Sets where every user&apos;s snippets are stored. Identity, login and
					2FA always stay on Supabase.
				</p>
				<div className={styles.inputGroup}>
					<span className={styles.label}>Backend</span>
					<select
						className={styles.modelSelect}
						value={backend}
						onChange={(event) =>
							handleBackendChange(event.target.value as StorageBackend)
						}
					>
						{StorageBackendValues.map((value) => (
							<option key={value} value={value}>
								{StorageBackendLabels[value]}
							</option>
						))}
					</select>
				</div>

				{StorageBackendFields[backend].map((field) => (
					<div className={styles.inputGroup} key={field.key}>
						<span className={styles.label}>{field.label}</span>
						<Input
							type={field.type === "number" ? "text" : field.type}
							inputMode={field.type === "number" ? "numeric" : undefined}
							name={field.key}
							placeholder={field.placeholder}
							maxLength={field.maxLength ?? 255}
							fat
							value={String(connection[field.key] ?? "")}
							onChange={(event: ChangeEvent<HTMLInputElement>) =>
								handleFieldChange(field.key, event.target.value, field.type)
							}
							disableMargin
							className={styles.input}
						/>
					</div>
				))}

				{StorageBackendFields[backend].length === 0 && (
					<p className={styles.helpText}>
						This backend needs no connection details.
					</p>
				)}

				{!secretConfigured && (
					<p className={styles.helpText}>
						Saving a backend requires STORAGE_CONFIG_SECRET on the server.
					</p>
				)}

				{testResult && (
					<Alert
						severity={
							testResult.ok ? FormMessageTypes.Success : FormMessageTypes.Error
						}
						className={styles.alert}
					>
						{testResult.ok
							? "Connection successful."
							: (testResult.error ?? "Connection failed.")}
					</Alert>
				)}

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
			</div>

			<div className={styles.section}>
				<h3 className={styles.sectionTitle}>Export snippets</h3>
				<p className={styles.helpText}>
					Download your snippets from the active backend.
				</p>
				<div className={styles.modelLoadGroup}>
					<a
						className={styles.loadModelsButton}
						href={`${StorageApiBasePath}/export?format=${ExportFormat.Sqlite}`}
					>
						Download .sqlite
					</a>
					<a
						className={styles.loadModelsButton}
						href={`${StorageApiBasePath}/export?format=${ExportFormat.Sql}`}
					>
						Download .sql dump
					</a>
				</div>
			</div>

			<div className={styles.buttonContainer}>
				<Button
					type="button"
					variant="secondary"
					onClick={handleTest}
					disabled={testing || saving}
					className={styles.cancelButton}
				>
					{testing ? <Loading width={20} height={20} /> : "Test connection"}
				</Button>
				<Button
					type="button"
					onClick={handleSave}
					disabled={saving || testing || !canSave}
					className={styles.submitButton}
				>
					{saving ? <Loading width={20} height={20} /> : "Save backend"}
				</Button>
			</div>
		</>
	);
};

export default DatabaseSettings;
