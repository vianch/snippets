const escapeHtml = (snippet: string): string =>
	snippet.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const stripMarkdownCodeFences = (text: string): string => {
	const trimmed = text.trim();
	const codeBlockRegex = /^```[\w]*\n?([\s\S]*?)```\s*$/;
	const match = trimmed.match(codeBlockRegex);
	const fencedBody = match?.[1];

	return fencedBody ? fencedBody.trim() : trimmed;
};

const normalizeRecoveryCode = (value: unknown): string => {
	if (typeof value !== "string") {
		return "";
	}

	return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
};

const uuidv4 = (): UUID => {
	if (typeof window !== "undefined" && window?.crypto?.randomUUID) {
		return window.crypto.randomUUID() as UUID;
	}

	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
		const r = (Math.random() * 16) | 0;

		const v = c === "x" ? r : (r & 0x3) | 0x8;

		return v.toString(16);
	}) as UUID;
};

export { escapeHtml, normalizeRecoveryCode, stripMarkdownCodeFences };

export default uuidv4;
