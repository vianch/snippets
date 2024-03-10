import { isClient } from "./ui.utils";

function uuidv4(): UUID {
	if (isClient() && window?.crypto?.randomUUID) {
		return window.crypto.randomUUID() as UUID;
	}

	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
		// eslint-disable-next-line no-bitwise
		const r = (Math.random() * 16) | 0;
		// eslint-disable-next-line no-bitwise
		const v = c === "x" ? r : (r & 0x3) | 0x8;

		return v.toString(16);
	}) as UUID;
}

export default uuidv4;
