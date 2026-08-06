import type { EditorView } from "@codemirror/view";

/* Lib */
import { TableRowLineBreak } from "@/lib/constants/table.constants";
import {
	findTableRange,
	getCellColumnBounds,
	serializeTable,
	splitTableRow,
} from "@/utils/table.utils";

// Shared CodeMirror <-> ParsedTable glue used by both the toolbar's insert
// action (tableActions.ts) and the cell-navigation keymap
// (markdownKeymap.ts), so the two never drift on how a cursor position maps
// to a table cell or how a serialized table maps back to a selection.

export const getDocumentLines = (view: EditorView): string[] =>
	view.state.doc.toString().split(TableRowLineBreak);

export const getCursorLineNumber = (view: EditorView): number =>
	view.state.doc.lineAt(view.state.selection.main.head).number;

export const getCurrentTableRange = (view: EditorView): TableLineRange | null =>
	findTableRange(getDocumentLines(view), getCursorLineNumber(view));

const getColumnIndexAtOffset = (
	lineText: string,
	offsetInLine: number,
	columnCount: number
): number => {
	const columnIndices = Array.from(
		{ length: columnCount },
		(_unused, index) => index
	);
	const matchingIndex = columnIndices.find((columnIndex) => {
		const bounds = getCellColumnBounds(lineText, columnIndex);

		return (
			bounds !== null &&
			offsetInLine >= bounds.start &&
			offsetInLine <= bounds.end
		);
	});

	return matchingIndex ?? Math.max(0, columnCount - 1);
};

export const getCursorCellPosition = (
	view: EditorView,
	range: TableLineRange
): TableCellPosition => {
	const cursorLine = view.state.doc.lineAt(view.state.selection.main.head);
	const offsetFromHeader = cursorLine.number - range.startLine;
	const logicalRow = offsetFromHeader <= 0 ? 0 : offsetFromHeader - 1;
	const columnCount = splitTableRow(cursorLine.text).length;
	const offsetInLine = view.state.selection.main.head - cursorLine.from;
	const column = getColumnIndexAtOffset(
		cursorLine.text,
		offsetInLine,
		columnCount
	);

	return { column, row: logicalRow };
};

export const computeSerializedCellSelection = (
	serializedText: string,
	position: TableCellPosition
): { anchor: number; head: number } => {
	const lines = serializedText.split(TableRowLineBreak);
	const lineIndex = position.row === 0 ? 0 : position.row + 1;
	const precedingLength = lines
		.slice(0, lineIndex)
		.reduce((total, line) => total + line.length + TableRowLineBreak.length, 0);
	const line = lines[lineIndex] ?? "";
	const bounds = getCellColumnBounds(line, position.column);

	if (!bounds) {
		return { anchor: precedingLength, head: precedingLength };
	}

	return {
		anchor: precedingLength + bounds.start,
		head: precedingLength + bounds.end,
	};
};

export const replaceTableRange = (
	view: EditorView,
	range: TableLineRange,
	table: ParsedTable,
	cursorPosition: TableCellPosition
): void => {
	const startLine = view.state.doc.line(range.startLine);
	const endLine = view.state.doc.line(range.endLine);
	const serializedText = serializeTable(table);
	const { anchor, head } = computeSerializedCellSelection(
		serializedText,
		cursorPosition
	);

	view.dispatch({
		changes: { from: startLine.from, insert: serializedText, to: endLine.to },
		selection: { anchor: startLine.from + anchor, head: startLine.from + head },
	});
	view.focus();
};
