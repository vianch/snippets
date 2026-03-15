import {
	defaultMaxAge,
	defaultPath,
	defaultSameSite,
} from "@/lib/constants/cookies";

export const getCookie = (name: string): string | null => {
	const match = document.cookie.match(
		new RegExp(
			`(?:^|; )${name.replace(/([.$?*|{}()[\]\\/+^])/g, "\\$1")}=([^;]*)`
		)
	);

	return match ? decodeURIComponent(match[1]) : null;
};

export const setCookie = (
	name: string,
	value: string,
	maxAge: number = defaultMaxAge
): void => {
	document.cookie = `${name}=${encodeURIComponent(value)};path=${defaultPath};max-age=${maxAge};SameSite=${defaultSameSite}`;
};

export const clearCookie = (name: string): void => {
	document.cookie = `${name}=;path=${defaultPath};max-age=0;SameSite=${defaultSameSite}`;
};
