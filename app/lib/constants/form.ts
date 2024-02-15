export enum FormMessageTypes {
	Error = "error",
	Success = "success",
	Warning = "warning",
	Unset = "unset",
}

export const regexPatterns = {
	email: /^[^\s@]+@[^\s@]+.[^\s@]+$/,
	password: /^(?!\s*$).+/,
};
