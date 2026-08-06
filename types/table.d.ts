import type { TableAlignment } from "@/lib/constants/table.constants";

declare global {
	type TableRow = string[];

	type ParsedTable = {
		alignments: TableAlignment[];
		bodyRows: TableRow[];
		headerCells: TableRow;
	};

	type TableLineRange = {
		endLine: number;
		startLine: number;
	};

	type TableCellPosition = {
		column: number;
		row: number;
	};

	type TableCellBounds = {
		end: number;
		start: number;
	};
}
