export const enum FormMessageTypes {
	Error = "error",
	Success = "success",
	Warning = "warning",
	Info = "info",
	Unset = "unset",
}

export const regexPatterns = {
	email: /^[^\s@]+@[^\s@]+.[^\s@]+$/,
	password: /^(?!\s*$).+/,
};

// GoTrue reports a disabled account as "banned"; surface the app's wording.
export const BannedErrorFragment = "banned";

export const DisabledUserMessage = "User is disabled";
