/* Lib */
import { ReadingWordsPerMinute } from "@/lib/constants/markdown.constants";

export const countCharacters = (content: string): number => content.length;

export const countWords = (content: string): number => {
	const trimmedContent = content.trim();

	if (trimmedContent.length === 0) {
		return 0;
	}

	return trimmedContent.split(/\s+/).length;
};

export const estimateReadingMinutes = (wordCount: number): number => {
	if (wordCount === 0) {
		return 0;
	}

	return Math.max(1, Math.ceil(wordCount / ReadingWordsPerMinute));
};
