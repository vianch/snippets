const readLines = async (
	reader: ReadableStreamDefaultReader<Uint8Array>,
	onLine: (line: string) => void,
	shouldStop?: () => boolean
): Promise<void> => {
	const decoder = new TextDecoder();
	let buffer = "";

	try {
		for (;;) {
			if (shouldStop?.()) {
				return;
			}

			const { done, value } = await reader.read();

			if (done) {
				break;
			}

			buffer += decoder.decode(value, { stream: true });

			let newlineIndex = buffer.indexOf("\n");

			while (newlineIndex !== -1) {
				onLine(buffer.slice(0, newlineIndex));
				buffer = buffer.slice(newlineIndex + 1);
				newlineIndex = buffer.indexOf("\n");
			}
		}

		if (buffer.trim().length > 0) {
			onLine(buffer);
		}
	} finally {
		await reader.cancel().catch(() => undefined);
	}
};

const readResponseLines = async (
	upstream: Response,
	onLine: (line: string) => void
): Promise<void> => {
	const reader = upstream.body?.getReader();

	if (!reader) {
		throw new Error("AI provider returned an empty response stream");
	}

	await readLines(reader, onLine);
};

export { readLines, readResponseLines };
