import { RecoveryCodeLength } from "@/lib/constants/mfa";

export const normalizeRecoveryCode = (value: string): string =>
	value.toUpperCase().replace(/[^A-Z0-9]/g, "");

export const formatRecoveryCode = (code: string): string => {
	const half = Math.floor(RecoveryCodeLength / 2);

	return `${code.slice(0, half)}-${code.slice(half)}`;
};

export const requestRecoveryCodes = async (): Promise<{
	codes: string[];
	error: string | null;
}> => {
	const response = await fetch("/api/mfa/recovery-codes", { method: "POST" });
	const data = await response.json().catch(() => ({}));

	if (!response.ok) {
		return {
			codes: [],
			error: data?.error ?? "Could not generate recovery codes",
		};
	}

	return { codes: data?.codes ?? [], error: null };
};

export const recoverWithRecoveryCode = async (
	code: string
): Promise<{ success: boolean; error: string | null }> => {
	const response = await fetch("/api/mfa/recover", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ code: normalizeRecoveryCode(code) }),
	});
	const data = await response.json().catch(() => ({}));

	if (!response.ok) {
		return { success: false, error: data?.error ?? "Invalid recovery code" };
	}

	return { success: true, error: null };
};
