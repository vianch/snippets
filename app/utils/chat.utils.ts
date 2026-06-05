import {
	fencedCodeBlockPattern,
	maxHistoryMessages,
	replaceIntentPattern,
	UserRole,
} from "@/lib/constants/ai";

const findWikiLinkContext = (
	text: string,
	caret: number
): WikiLinkContext | null => {
	const before = text.slice(0, caret);
	const openIdx = before.lastIndexOf("[[");

	if (openIdx === -1) {
		return null;
	}

	const segment = before.slice(openIdx + 2);

	if (segment.includes("]") || segment.includes("\n")) {
		return null;
	}

	return { start: openIdx, query: segment };
};

const extractFencedBlocks = (
	text: string
): Array<{ language: string; body: string }> => {
	const blocks: Array<{ language: string; body: string }> = [];
	const matches = text.matchAll(fencedCodeBlockPattern);

	for (const match of matches) {
		blocks.push({ language: match[1] ?? "", body: match[2] ?? "" });
	}

	return blocks;
};

// Splits an assistant answer into ordered prose/code segments so the UI can
// render prose as markdown and fenced code blocks as interactive components.
// Uses a fresh regex so the shared global pattern's lastIndex is never mutated.
const parseAssistantSegments = (content: string): AssistantSegment[] => {
	const segments: AssistantSegment[] = [];
	const pattern = new RegExp(fencedCodeBlockPattern.source, "g");
	let lastIndex = 0;
	let match: RegExpExecArray | null = pattern.exec(content);

	while (match !== null) {
		if (match.index > lastIndex) {
			segments.push({
				type: "prose",
				content: content.slice(lastIndex, match.index),
			});
		}

		segments.push({
			type: "code",
			language: match[1] ?? "",
			body: match[2] ?? "",
		});
		lastIndex = match.index + match[0].length;
		match = pattern.exec(content);
	}

	if (lastIndex < content.length) {
		segments.push({ type: "prose", content: content.slice(lastIndex) });
	}

	return segments;
};

const detectReplaceCandidate = (
	userPrompt: string | undefined,
	assistantResponse: string,
	snippetLanguage: string
): boolean => {
	if (!userPrompt || !snippetLanguage) {
		return false;
	}

	if (!replaceIntentPattern.test(userPrompt)) {
		return false;
	}

	const blocks = extractFencedBlocks(assistantResponse);

	if (blocks.length !== 1) {
		return false;
	}

	const block = blocks[0];

	if (!block.language) {
		return false;
	}

	return block.language.toLowerCase() === snippetLanguage.toLowerCase();
};

const extractCodeBlockBody = (text: string): string | null => {
	const blocks = extractFencedBlocks(text);

	return blocks.length === 1 ? blocks[0].body : null;
};

const sanitizeHistory = (
	history: AiHistoryMessage[] | undefined
): AiHistoryMessage[] => {
	if (!Array.isArray(history)) {
		return [];
	}

	const cleaned = history
		.filter(
			(entry): entry is AiHistoryMessage =>
				Boolean(entry) &&
				typeof entry === "object" &&
				(entry.role === UserRole.User || entry.role === UserRole.Assistant) &&
				typeof entry.content === "string" &&
				entry.content.trim().length > 0
		)
		.map((entry) => ({ role: entry.role, content: entry.content }));

	return cleaned.slice(-maxHistoryMessages);
};

export {
	detectReplaceCandidate,
	extractCodeBlockBody,
	extractFencedBlocks,
	findWikiLinkContext,
	parseAssistantSegments,
	sanitizeHistory,
};
