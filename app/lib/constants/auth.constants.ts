// Password-recovery routing and the GoTrue OTP type used to redeem an
// admin-generated recovery link. The admin "reset password" action builds a
// link to ResetPasswordRoutePath carrying the hashed token; the reset page
// redeems it with verifyOtp({ token_hash, type: RecoveryOtpType }).

export const ResetPasswordRoutePath = "/reset-password";

export const RecoveryTokenHashParam = "token_hash";

export const RecoveryTypeParam = "type";

// Matches the EmailOtpType GoTrue expects for password recovery.
export const RecoveryOtpType = "recovery";

export const enum ResetPasswordStep {
	Done = "done",
	Form = "form",
}
