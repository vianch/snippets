import supabase from "@/lib/supabase/client";
import {
	MfaAssuranceLevel,
	MfaFactorStatus,
	MfaFactorType,
	MfaFriendlyName,
} from "@/lib/constants/mfa";

export const isMfaChallengeRequired = async (): Promise<boolean> => {
	const { data, error } =
		await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

	if (error || !data) {
		return false;
	}

	return (
		data.currentLevel === MfaAssuranceLevel.Aal1 &&
		data.nextLevel === MfaAssuranceLevel.Aal2
	);
};

export const isMfaEnabled = async (): Promise<boolean> => {
	const factorId = await getVerifiedTotpFactorId();

	return Boolean(factorId);
};

export const getVerifiedTotpFactorId = async (): Promise<string | null> => {
	const { data, error } = await supabase.auth.mfa.listFactors();

	if (error || !data) {
		return null;
	}

	const verifiedFactor = data.totp.find(
		(factor) => factor.status === MfaFactorStatus.Verified
	);

	return verifiedFactor?.id ?? null;
};

export const enrollTotpFactor = async (): Promise<{
	enrollment: TotpEnrollment | null;
	error: string | null;
}> => {
	const { data, error } = await supabase.auth.mfa.enroll({
		factorType: MfaFactorType.Totp,
		friendlyName: `${MfaFriendlyName} ${Date.now()}`,
	});

	if (error || !data) {
		return { enrollment: null, error: error?.message ?? "Enrollment failed" };
	}

	return {
		enrollment: {
			factorId: data.id,
			qrCode: data.totp.qr_code,
			secret: data.totp.secret,
			uri: data.totp.uri,
		},
		error: null,
	};
};

export const challengeAndVerifyMfaFactor = async (
	factorId: string,
	code: string
): Promise<{ error: string | null }> => {
	const { error } = await supabase.auth.mfa.challengeAndVerify({
		factorId,
		code,
	});

	return { error: error?.message ?? null };
};

export const unenrollMfaFactor = async (
	factorId: string
): Promise<{ error: string | null }> => {
	const { error } = await supabase.auth.mfa.unenroll({ factorId });

	return { error: error?.message ?? null };
};

export const cleanupUnverifiedTotpFactors = async (): Promise<void> => {
	const { data } = await supabase.auth.mfa.listFactors();

	if (!data) {
		return;
	}

	const unverifiedFactors = data.all.filter(
		(factor) =>
			factor.factor_type === MfaFactorType.Totp &&
			factor.status === MfaFactorStatus.Unverified
	);

	await Promise.all(
		unverifiedFactors.map((factor) =>
			supabase.auth.mfa.unenroll({ factorId: factor.id })
		)
	);
};
