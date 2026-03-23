import { isClient } from "./ui.utils";

const escapeHtml = (snippet: string): string =>
	snippet.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const uuidv4 = (): UUID => {
	if (isClient() && window?.crypto?.randomUUID) {
		return window.crypto.randomUUID() as UUID;
	}

	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
		const r = (Math.random() * 16) | 0;

		const v = c === "x" ? r : (r & 0x3) | 0x8;

		return v.toString(16);
	}) as UUID;
};

export { escapeHtml };

export default uuidv4;
