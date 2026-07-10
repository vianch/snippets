import type { EditorView } from "@codemirror/view";

/* Lib */
import {
	defaultMarkdownFileName,
	markdownFileExtension,
	markdownMimeType,
} from "@/lib/constants/markdown.constants";

export const insertTextIntoEditor = (view: EditorView, text: string): void => {
	const { from, to } = view.state.selection.main;

	view.dispatch({
		changes: { from, to, insert: text },
		selection: { anchor: from + text.length },
	});
	view.focus();
};

export const downloadMarkdownFile = (
	fileName: string,
	content: string
): void => {
	const trimmedName = fileName.trim() || defaultMarkdownFileName;
	const downloadName = trimmedName.endsWith(markdownFileExtension)
		? trimmedName
		: `${trimmedName}${markdownFileExtension}`;
	const blob = new Blob([content], { type: markdownMimeType });
	const objectUrl = URL.createObjectURL(blob);
	const anchor = document.createElement("a");

	anchor.href = objectUrl;
	anchor.download = downloadName;
	anchor.click();
	URL.revokeObjectURL(objectUrl);
};
