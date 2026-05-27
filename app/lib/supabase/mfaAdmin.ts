import { createHash, randomInt } from "crypto";

import createSupabaseAdminClient from "@/lib/supabase/admin";
import {
	MfaFactorType,
	RecoveryCodeAlphabet,
	RecoveryCodeCount,
	RecoveryCodeLength,
	RecoveryCodeMetadataKey,
} from "@/lib/constants/mfa";

const hashRecoveryCode = (code: string): string =>
	createHash("sha256").update(code).digest("hex");

const buildRecoveryCode = (): string =>
	Array.from({ length: RecoveryCodeLength }, () =>
		RecoveryCodeAlphabet.charAt(randomInt(RecoveryCodeAlphabet.length))
	).join("");

const readStoredHashes = (appMetadata: unknown): string[] => {
	if (!appMetadata || typeof appMetadata !== "object") {
		return [];
	}

	const stored = (appMetadata as Record<string, unknown>)[
		RecoveryCodeMetadataKey
	];

	if (!Array.isArray(stored)) {
		return [];
	}

	return stored.filter((hash): hash is string => typeof hash === "string");
};

export const generateRecoveryCodes = (): {
	hashes: string[];
	plainCodes: string[];
} => {
	const plainCodes = Array.from(
		{ length: RecoveryCodeCount },
		buildRecoveryCode
	);
	const hashes = plainCodes.map(hashRecoveryCode);

	return { hashes, plainCodes };
};

export const storeRecoveryCodeHashes = async (
	userId: string,
	hashes: string[]
): Promise<{ error: string | null }> => {
	const admin = createSupabaseAdminClient();
	const { error } = await admin.auth.admin.updateUserById(userId, {
		app_metadata: { [RecoveryCodeMetadataKey]: hashes },
	});

	return { error: error?.message ?? null };
};

export const consumeRecoveryCode = async (
	userId: string,
	code: string
): Promise<boolean> => {
	const admin = createSupabaseAdminClient();
	const { data, error } = await admin.auth.admin.getUserById(userId);

	if (error || !data?.user) {
		return false;
	}

	const storedHashes = readStoredHashes(data.user.app_metadata);
	const submittedHash = hashRecoveryCode(code);

	if (!storedHashes.includes(submittedHash)) {
		return false;
	}

	const remainingHashes = storedHashes.filter((hash) => hash !== submittedHash);

	await admin.auth.admin.updateUserById(userId, {
		app_metadata: { [RecoveryCodeMetadataKey]: remainingHashes },
	});

	return true;
};

export const deleteUserMfaFactors = async (
	userId: string
): Promise<{ error: string | null }> => {
	const admin = createSupabaseAdminClient();
	const { data, error } = await admin.auth.admin.mfa.listFactors({ userId });

	if (error || !data) {
		return { error: error?.message ?? "Could not list factors" };
	}

	await Promise.all(
		data.factors
			.filter((factor) => factor.factor_type === MfaFactorType.Totp)
			.map((factor) =>
				admin.auth.admin.mfa.deleteFactor({ id: factor.id, userId })
			)
	);

	return { error: null };
};
