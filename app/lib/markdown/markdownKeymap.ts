import { Prec } from "@codemirror/state";
import { keymap } from "@codemirror/view";

import type { Extension } from "@codemirror/state";
import type { Command, KeyBinding } from "@codemirror/view";

/* Lib */
import {
	boldShortcutKey,
	duplicateLineShortcutKey,
	inlineCodeShortcutKey,
	italicShortcutKey,
} from "@/lib/constants/markdown.constants";
import {
	wrapSelectionWithBold,
	wrapSelectionWithInlineCode,
	wrapSelectionWithItalic,
} from "@/lib/markdown/markdownToolbarActions";

const toggleBold: Command = (view) => {
	wrapSelectionWithBold(view);

	return true;
};

const toggleItalic: Command = (view) => {
	wrapSelectionWithItalic(view);

	return true;
};

const toggleInlineCode: Command = (view) => {
	wrapSelectionWithInlineCode(view);

	return true;
};

const duplicateLineBelow: Command = (view) => {
	const { state } = view;
	const range = state.selection.main;
	const startLine = state.doc.lineAt(range.from);
	const endLine = state.doc.lineAt(range.to);
	const blockStart = startLine.from;
	const blockText = state.doc.sliceString(blockStart, endLine.to);
	const insertFrom = endLine.to;
	const duplicatedBlockStart = insertFrom + 1;

	view.dispatch({
		changes: { from: insertFrom, insert: `\n${blockText}` },
		scrollIntoView: true,
		selection: {
			anchor: duplicatedBlockStart + (range.anchor - blockStart),
			head: duplicatedBlockStart + (range.head - blockStart),
		},
	});

	return true;
};

const markdownKeyBindings: KeyBinding[] = [
	{ key: boldShortcutKey, preventDefault: true, run: toggleBold },
	{ key: italicShortcutKey, preventDefault: true, run: toggleItalic },
	{ key: inlineCodeShortcutKey, preventDefault: true, run: toggleInlineCode },
	{
		key: duplicateLineShortcutKey,
		preventDefault: true,
		run: duplicateLineBelow,
	},
];

const markdownKeymap: Extension = Prec.high(keymap.of(markdownKeyBindings));

export default markdownKeymap;
