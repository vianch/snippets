export const enum AuthFormStep {
	Credentials = "credentials",
	MfaVerification = "mfa-verification",
}

export const enum MfaAssuranceLevel {
	Aal1 = "aal1",
	Aal2 = "aal2",
}

export const enum MfaFactorStatus {
	Unverified = "unverified",
	Verified = "verified",
}

export const enum MfaFactorType {
	Totp = "totp",
}

export const enum TwoFactorMode {
	Disabled = "disabled",
	Disabling = "disabling",
	Enabled = "enabled",
	Enrolling = "enrolling",
	RecoveryCodes = "recovery-codes",
}

export const MfaCodeLength = 6;

export const MfaFriendlyName = "Snippets Authenticator";

export const RecoveryCodeAlphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export const RecoveryCodeCount = 10;

export const RecoveryCodeLength = 10;

export const RecoveryCodeMetadataKey = "mfa_recovery_codes";
