import {
	TableAlignment,
	TableAlignmentColonCharacter,
	TableCellPaddingSpace,
	TableDefaultColumnCount,
	TableDefaultRowCount,
	TableDelimiterCellPattern,
	TableDelimiterCharacter,
	TableEmptyCellText,
	TableInsertPosition,
	TableMinimumColumnWidth,
	TablePipeCharacter,
	TableRowLineBreak,
} from "@/lib/constants/table.constants";

// Escaped pipes (`\|`) inside cell content are intentionally unsupported in
// this POC: every helper below treats every unescaped `|` as a cell
// separator, which matches how the vast majority of hand-written tables and
// the toolbar/keymap-generated ones look.

const findPipeIndices = (lineText: string): number[] =>
	Array.from(lineText).reduce<number[]>((pipeIndices, character, index) => {
		if (character !== TablePipeCharacter) {
			return pipeIndices;
		}

		return [...pipeIndices, index];
	}, []);

const getRowBoundaryIndices = (lineText: string): number[] => {
	const pipeIndices = findPipeIndices(lineText);
	const hasLeadingPipe = lineText.trimStart().startsWith(TablePipeCharacter);
	const hasTrailingPipe = lineText.trimEnd().endsWith(TablePipeCharacter);
	const leadingBoundary = hasLeadingPipe ? [] : [-1];
	const trailingBoundary = hasTrailingPipe ? [] : [lineText.length];

	return [...leadingBoundary, ...pipeIndices, ...trailingBoundary];
};

const trimBounds = (
	lineText: string,
	bounds: TableCellBounds
): TableCellBounds => {
	const rawText = lineText.slice(bounds.start, bounds.end);
	const leadingWhitespaceLength = rawText.length - rawText.trimStart().length;
	const trailingWhitespaceLength = rawText.length - rawText.trimEnd().length;
	const start = bounds.start + leadingWhitespaceLength;
	const end = Math.max(start, bounds.end - trailingWhitespaceLength);

	return { end, start };
};

const getRowCellBounds = (lineText: string): TableCellBounds[] => {
	const boundaries = getRowBoundaryIndices(lineText);
	const starts = boundaries.slice(0, -1).map((boundary) => boundary + 1);
	const ends = boundaries.slice(1);

	return starts.map((start, index) =>
		trimBounds(lineText, { end: ends[index] ?? start, start })
	);
};

export const splitTableRow = (lineText: string): TableRow =>
	getRowCellBounds(lineText).map((bounds) =>
		lineText.slice(bounds.start, bounds.end)
	);

export const getCellColumnBounds = (
	lineText: string,
	columnIndex: number
): TableCellBounds | null => getRowCellBounds(lineText)[columnIndex] ?? null;

export const isTableRowLine = (lineText: string): boolean =>
	lineText.trim().length > 0 && lineText.includes(TablePipeCharacter);

export const isTableDelimiterLine = (lineText: string): boolean => {
	if (lineText.trim().length === 0) {
		return false;
	}

	const cells = splitTableRow(lineText);

	return (
		cells.length > 0 &&
		cells.every((cell) => TableDelimiterCellPattern.test(cell))
	);
};

const findLastContiguousRowLineIndex = (
	documentLines: string[],
	startIndex: number
): number => {
	const availableCount = Math.max(0, documentLines.length - startIndex);
	const candidateIndices = Array.from(
		{ length: availableCount },
		(_unused, offset) => startIndex + offset
	);
	const firstNonRowOffset = candidateIndices.findIndex((lineIndex) => {
		const line = documentLines[lineIndex];

		return line === undefined || !isTableRowLine(line);
	});
	const contiguousRowCount =
		firstNonRowOffset === -1 ? candidateIndices.length : firstNonRowOffset;

	return startIndex + contiguousRowCount - 1;
};

export const findTableRange = (
	documentLines: string[],
	cursorLineNumber: number
): TableLineRange | null => {
	const cursorLineIndex = cursorLineNumber - 1;
	const candidateHeaderIndices = Array.from(
		{ length: cursorLineIndex + 1 },
		(_unused, offset) => cursorLineIndex - offset
	);

	return candidateHeaderIndices.reduce<TableLineRange | null>(
		(foundRange, headerLineIndex) => {
			if (foundRange) {
				return foundRange;
			}

			const headerLine = documentLines[headerLineIndex];
			const delimiterLine = documentLines[headerLineIndex + 1];

			if (headerLine === undefined || delimiterLine === undefined) {
				return null;
			}

			if (!isTableRowLine(headerLine) || !isTableDelimiterLine(delimiterLine)) {
				return null;
			}

			const columnCount = splitTableRow(headerLine).length;

			if (splitTableRow(delimiterLine).length !== columnCount) {
				return null;
			}

			const lastBodyLineIndex = findLastContiguousRowLineIndex(
				documentLines,
				headerLineIndex + 2
			);

			if (cursorLineIndex > lastBodyLineIndex) {
				return null;
			}

			return { endLine: lastBodyLineIndex + 1, startLine: headerLineIndex + 1 };
		},
		null
	);
};

export const isCursorInTable = (
	documentLines: string[],
	cursorLineNumber: number
): boolean => findTableRange(documentLines, cursorLineNumber) !== null;

const normalizeRowLength = (row: TableRow, columnCount: number): TableRow =>
	Array.from(
		{ length: columnCount },
		(_unused, columnIndex) => row[columnIndex] ?? TableEmptyCellText
	);

const normalizeAlignmentsLength = (
	alignments: TableAlignment[],
	columnCount: number
): TableAlignment[] =>
	Array.from(
		{ length: columnCount },
		(_unused, columnIndex) => alignments[columnIndex] ?? TableAlignment.None
	);

const parseAlignmentFromDelimiterCell = (
	delimiterCell: string
): TableAlignment => {
	const hasLeadingColon = delimiterCell.startsWith(
		TableAlignmentColonCharacter
	);
	const hasTrailingColon = delimiterCell.endsWith(TableAlignmentColonCharacter);

	if (hasLeadingColon && hasTrailingColon) {
		return TableAlignment.Center;
	}

	if (hasTrailingColon) {
		return TableAlignment.Right;
	}

	if (hasLeadingColon) {
		return TableAlignment.Left;
	}

	return TableAlignment.None;
};

export const parseTable = (
	documentLines: string[],
	range: TableLineRange
): ParsedTable => {
	const headerLineIndex = range.startLine - 1;
	const delimiterLineIndex = headerLineIndex + 1;
	const bodyLineIndices = Array.from(
		{ length: range.endLine - delimiterLineIndex - 1 },
		(_unused, offset) => delimiterLineIndex + 1 + offset
	);
	const headerCells = splitTableRow(documentLines[headerLineIndex] ?? "");
	const alignments = splitTableRow(documentLines[delimiterLineIndex] ?? "").map(
		parseAlignmentFromDelimiterCell
	);
	const bodyRows = bodyLineIndices.map((lineIndex) =>
		normalizeRowLength(
			splitTableRow(documentLines[lineIndex] ?? ""),
			headerCells.length
		)
	);

	return {
		alignments: normalizeAlignmentsLength(alignments, headerCells.length),
		bodyRows,
		headerCells,
	};
};

const buildDelimiterCell = (
	width: number,
	alignment: TableAlignment
): string => {
	const usesLeadingColon =
		alignment === TableAlignment.Left || alignment === TableAlignment.Center;
	const usesTrailingColon =
		alignment === TableAlignment.Right || alignment === TableAlignment.Center;
	const colonCount = (usesLeadingColon ? 1 : 0) + (usesTrailingColon ? 1 : 0);
	const dashCount = Math.max(1, width - colonCount);
	const dashes = TableDelimiterCharacter.repeat(dashCount);

	return `${usesLeadingColon ? TableAlignmentColonCharacter : ""}${dashes}${usesTrailingColon ? TableAlignmentColonCharacter : ""}`;
};

const justifyCellText = (
	text: string,
	width: number,
	alignment: TableAlignment
): string => {
	const paddingLength = Math.max(0, width - text.length);

	if (alignment === TableAlignment.Right) {
		return `${TableCellPaddingSpace.repeat(paddingLength)}${text}`;
	}

	if (alignment === TableAlignment.Center) {
		const leftPadding = Math.floor(paddingLength / 2);
		const rightPadding = paddingLength - leftPadding;

		return `${TableCellPaddingSpace.repeat(leftPadding)}${text}${TableCellPaddingSpace.repeat(rightPadding)}`;
	}

	return `${text}${TableCellPaddingSpace.repeat(paddingLength)}`;
};

const computeColumnWidths = (table: ParsedTable): number[] =>
	table.headerCells.map((headerCell, columnIndex) => {
		const bodyCellLengths = table.bodyRows.map(
			(row) => (row[columnIndex] ?? TableEmptyCellText).length
		);

		return Math.max(
			headerCell.length,
			...bodyCellLengths,
			TableMinimumColumnWidth
		);
	});

const buildRowLine = (
	cells: TableRow,
	widths: number[],
	alignments: TableAlignment[]
): string => {
	const cellSeparator = `${TableCellPaddingSpace}${TablePipeCharacter}${TableCellPaddingSpace}`;
	const justifiedCells = widths.map((width, columnIndex) =>
		justifyCellText(
			cells[columnIndex] ?? TableEmptyCellText,
			width,
			alignments[columnIndex] ?? TableAlignment.None
		)
	);

	return `${TablePipeCharacter}${TableCellPaddingSpace}${justifiedCells.join(cellSeparator)}${TableCellPaddingSpace}${TablePipeCharacter}`;
};

export const serializeTable = (table: ParsedTable): string => {
	const columnWidths = computeColumnWidths(table);
	const headerAlignments = table.headerCells.map(() => TableAlignment.None);
	const headerLine = buildRowLine(
		table.headerCells,
		columnWidths,
		headerAlignments
	);
	const delimiterCells = columnWidths.map((width, columnIndex) =>
		buildDelimiterCell(
			width,
			table.alignments[columnIndex] ?? TableAlignment.None
		)
	);
	const delimiterLine = buildRowLine(
		delimiterCells,
		columnWidths,
		headerAlignments
	);
	const bodyLines = table.bodyRows.map((row) =>
		buildRowLine(row, columnWidths, table.alignments)
	);

	return [headerLine, delimiterLine, ...bodyLines].join(TableRowLineBreak);
};

export const buildEmptyTable = (
	rowCount: number = TableDefaultRowCount,
	columnCount: number = TableDefaultColumnCount
): ParsedTable => {
	const bodyRowCount = Math.max(0, rowCount - 1);

	return {
		alignments: Array.from({ length: columnCount }, () => TableAlignment.None),
		bodyRows: Array.from({ length: bodyRowCount }, () =>
			Array.from({ length: columnCount }, () => TableEmptyCellText)
		),
		headerCells: Array.from({ length: columnCount }, () => TableEmptyCellText),
	};
};

export const getRowCount = (table: ParsedTable): number =>
	1 + table.bodyRows.length;

export const getColumnCount = (table: ParsedTable): number =>
	table.headerCells.length;

export const getRowLineIndex = (
	range: TableLineRange,
	logicalRowIndex: number
): number => {
	const headerLineIndex = range.startLine - 1;

	return logicalRowIndex === 0
		? headerLineIndex
		: headerLineIndex + logicalRowIndex + 1;
};

const resolveInsertIndex = (
	referenceIndex: number,
	position: TableInsertPosition
): number =>
	position === TableInsertPosition.Before ? referenceIndex : referenceIndex + 1;

export const insertRow = (
	table: ParsedTable,
	logicalRowIndex: number,
	position: TableInsertPosition
): ParsedTable => {
	const bodyReferenceIndex = logicalRowIndex - 1;
	const insertIndex = Math.max(
		0,
		resolveInsertIndex(bodyReferenceIndex, position)
	);
	const newRow = table.headerCells.map(() => TableEmptyCellText);

	return {
		...table,
		bodyRows: [
			...table.bodyRows.slice(0, insertIndex),
			newRow,
			...table.bodyRows.slice(insertIndex),
		],
	};
};

export const deleteRow = (
	table: ParsedTable,
	logicalRowIndex: number
): ParsedTable => {
	if (logicalRowIndex === 0) {
		const [firstBodyRow, ...remainingBodyRows] = table.bodyRows;

		if (firstBodyRow === undefined) {
			return table;
		}

		return { ...table, bodyRows: remainingBodyRows, headerCells: firstBodyRow };
	}

	const bodyIndex = logicalRowIndex - 1;

	return {
		...table,
		bodyRows: table.bodyRows.filter((_unused, index) => index !== bodyIndex),
	};
};

const insertAtIndex = <ElementType>(
	items: ElementType[],
	index: number,
	value: ElementType
): ElementType[] => [...items.slice(0, index), value, ...items.slice(index)];

const removeAtIndex = <ElementType>(
	items: ElementType[],
	index: number
): ElementType[] => items.filter((_unused, itemIndex) => itemIndex !== index);

export const insertColumn = (
	table: ParsedTable,
	columnIndex: number,
	position: TableInsertPosition
): ParsedTable => {
	const insertIndex = resolveInsertIndex(columnIndex, position);

	return {
		alignments: insertAtIndex(
			table.alignments,
			insertIndex,
			TableAlignment.None
		),
		bodyRows: table.bodyRows.map((row) =>
			insertAtIndex(row, insertIndex, TableEmptyCellText)
		),
		headerCells: insertAtIndex(
			table.headerCells,
			insertIndex,
			TableEmptyCellText
		),
	};
};

export const deleteColumn = (
	table: ParsedTable,
	columnIndex: number
): ParsedTable => {
	if (getColumnCount(table) <= 1) {
		return table;
	}

	return {
		alignments: removeAtIndex(table.alignments, columnIndex),
		bodyRows: table.bodyRows.map((row) => removeAtIndex(row, columnIndex)),
		headerCells: removeAtIndex(table.headerCells, columnIndex),
	};
};

// GFM pipe tables always require a header + delimiter line, so there is no
// way to truly remove the header. "Toggling" it swaps the header content
// with the first body row instead, which mirrors what most rich editors do
// when the underlying format can't drop the header row entirely.
export const toggleHeaderPresence = (table: ParsedTable): ParsedTable => {
	const [firstBodyRow, ...remainingBodyRows] = table.bodyRows;

	if (firstBodyRow === undefined) {
		return {
			...table,
			bodyRows: [table.headerCells],
			headerCells: table.headerCells.map(() => TableEmptyCellText),
		};
	}

	return {
		...table,
		bodyRows: [table.headerCells, ...remainingBodyRows],
		headerCells: firstBodyRow,
	};
};

export const setColumnAlignment = (
	table: ParsedTable,
	columnIndex: number,
	alignment: TableAlignment
): ParsedTable => ({
	...table,
	alignments: table.alignments.map((currentAlignment, index) =>
		index === columnIndex ? alignment : currentAlignment
	),
});

export const getNextCellPosition = (
	table: ParsedTable,
	position: TableCellPosition
): TableCellPosition | null => {
	const columnCount = getColumnCount(table);
	const rowCount = getRowCount(table);
	const isLastColumn = position.column >= columnCount - 1;

	if (!isLastColumn) {
		return { column: position.column + 1, row: position.row };
	}

	if (position.row >= rowCount - 1) {
		return null;
	}

	return { column: 0, row: position.row + 1 };
};

export const getPreviousCellPosition = (
	table: ParsedTable,
	position: TableCellPosition
): TableCellPosition | null => {
	const columnCount = getColumnCount(table);
	const isFirstColumn = position.column <= 0;

	if (!isFirstColumn) {
		return { column: position.column - 1, row: position.row };
	}

	if (position.row <= 0) {
		return null;
	}

	return { column: columnCount - 1, row: position.row - 1 };
};

export const isLastTableRow = (
	table: ParsedTable,
	position: TableCellPosition
): boolean => position.row === getRowCount(table) - 1;
