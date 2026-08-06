import { Prec } from "@codemirror/state";
import { keymap } from "@codemirror/view";

import type { Extension } from "@codemirror/state";
import type { Command, EditorView, KeyBinding } from "@codemirror/view";

/* Lib */
import {
	boldShortcutKey,
	duplicateLineShortcutKey,
	inlineCodeShortcutKey,
	italicShortcutKey,
	strikethroughShortcutKey,
	tableEnterKey,
	tableTabKey,
} from "@/lib/constants/markdown.constants";
import { TableInsertPosition } from "@/lib/constants/table.constants";
import {
	wrapSelectionWithBold,
	wrapSelectionWithInlineCode,
	wrapSelectionWithItalic,
	wrapSelectionWithStrikethrough,
} from "@/lib/markdown/markdownToolbarActions";
import {
	getCurrentTableRange,
	getCursorCellPosition,
	getDocumentLines,
	replaceTableRange,
} from "@/lib/markdown/tableEditor";
import {
	getNextCellPosition,
	getPreviousCellPosition,
	insertRow,
	isLastTableRow,
	parseTable,
} from "@/utils/table.utils";

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

const toggleStrikethrough: Command = (view) => {
	wrapSelectionWithStrikethrough(view);

	return true;
};

type TableContext = {
	position: TableCellPosition;
	range: TableLineRange;
	table: ParsedTable;
};

const getTableContext = (view: EditorView): TableContext | null => {
	const range = getCurrentTableRange(view);

	if (!range) {
		return null;
	}

	const table = parseTable(getDocumentLines(view), range);
	const position = getCursorCellPosition(view, range);

	return { position, range, table };
};

const appendRowAndMoveTo = (
	view: EditorView,
	{ position, range, table }: TableContext
): boolean => {
	const nextTable = insertRow(table, position.row, TableInsertPosition.After);

	replaceTableRange(view, range, nextTable, {
		column: 0,
		row: position.row + 1,
	});

	return true;
};

const tableTab: Command = (view) => {
	const context = getTableContext(view);

	if (!context) {
		return false;
	}

	const nextPosition = getNextCellPosition(context.table, context.position);

	if (!nextPosition) {
		return appendRowAndMoveTo(view, context);
	}

	replaceTableRange(view, context.range, context.table, nextPosition);

	return true;
};

const tableShiftTab: Command = (view) => {
	const context = getTableContext(view);

	if (!context) {
		return false;
	}

	const previousPosition = getPreviousCellPosition(
		context.table,
		context.position
	);

	replaceTableRange(
		view,
		context.range,
		context.table,
		previousPosition ?? context.position
	);

	return true;
};

const tableEnter: Command = (view) => {
	const context = getTableContext(view);

	if (!context) {
		return false;
	}

	if (isLastTableRow(context.table, context.position)) {
		return appendRowAndMoveTo(view, context);
	}

	const nextPosition: TableCellPosition = {
		column: context.position.column,
		row: context.position.row + 1,
	};

	replaceTableRange(view, context.range, context.table, nextPosition);

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
		key: strikethroughShortcutKey,
		preventDefault: true,
		run: toggleStrikethrough,
	},
	{
		key: duplicateLineShortcutKey,
		preventDefault: true,
		run: duplicateLineBelow,
	},
	{ key: tableTabKey, run: tableTab, shift: tableShiftTab },
	{ key: tableEnterKey, run: tableEnter },
];

const markdownKeymap: Extension = Prec.high(keymap.of(markdownKeyBindings));

export default markdownKeymap;
