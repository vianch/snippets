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
