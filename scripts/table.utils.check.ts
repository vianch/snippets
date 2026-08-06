// Runnable self-check for app/utils/table.utils.ts (there is no test runner
// in this repo). Run with: npx tsx scripts/table.utils.check.ts
//
// Location: deliberately NOT under app/utils/ (a `table.utils.check.ts` there
// would still typecheck/lint fine, since neither tsc nor ESLint enforce the
// "utils are pure functions only" rule mechanically — it's a convention, not
// tooling) but it would violate that convention itself (assert calls +
// process.stdout writes are not pure) and would sit oddly next to the real
// util. Next.js only bundles what a page/route actually imports, so this
// file is never pulled into the app bundle regardless of folder; putting it
// under scripts/ just keeps app/utils/ honestly "pure functions only" on
// disk. It is still picked up by the repo-wide tsconfig ("**/*.ts") and
// ESLint globs ("**/*.{ts,tsx}"), and passes both.
import assert from "node:assert/strict";

import {
	TableAlignment,
	TableInsertPosition,
} from "../app/lib/constants/table.constants";
import {
	buildEmptyTable,
	deleteColumn,
	deleteRow,
	findTableRange,
	getNextCellPosition,
	getPreviousCellPosition,
	insertColumn,
	insertRow,
	isLastTableRow,
	parseTable,
	serializeTable,
	setColumnAlignment,
	toggleHeaderPresence,
} from "../app/utils/table.utils";

const results: string[] = [];

const check = (description: string, run: () => void): void => {
	run();
	results.push(`ok - ${description}`);
};

const sourceTableLines = [
	"intro line",
	"| Name | Age |",
	"| :--- | ---: |",
	"| Ada  | 30  |",
	"| Grace | 40 |",
	"outro line",
];

check("findTableRange locates the table from any cursor line inside it", () => {
	assert.deepEqual(findTableRange(sourceTableLines, 2), {
		endLine: 5,
		startLine: 2,
	});
	assert.deepEqual(findTableRange(sourceTableLines, 4), {
		endLine: 5,
		startLine: 2,
	});
	assert.equal(findTableRange(sourceTableLines, 1), null);
	assert.equal(findTableRange(sourceTableLines, 6), null);
});

check(
	"parse -> serialize round trip preserves cell content and alignment",
	() => {
		const range = findTableRange(sourceTableLines, 3);

		assert.ok(range);

		if (!range) {
			return;
		}

		const table = parseTable(sourceTableLines, range);

		assert.deepEqual(table.headerCells, ["Name", "Age"]);
		assert.deepEqual(table.alignments, [
			TableAlignment.Left,
			TableAlignment.Right,
		]);
		assert.deepEqual(table.bodyRows, [
			["Ada", "30"],
			["Grace", "40"],
		]);

		const serialized = serializeTable(table);
		const reparsedRange = findTableRange(serialized.split("\n"), 1);

		assert.ok(reparsedRange);

		if (!reparsedRange) {
			return;
		}

		const reparsedTable = parseTable(serialized.split("\n"), reparsedRange);

		assert.deepEqual(reparsedTable, table);
	}
);

check(
	"serializeTable re-realigns columns: equal pipe positions after an uneven edit",
	() => {
		const range = findTableRange(sourceTableLines, 2);

		assert.ok(range);

		if (!range) {
			return;
		}

		const table = parseTable(sourceTableLines, range);
		// Simulate typing a much longer value into one cell, then re-serializing
		// (the "auto-realign" behavior every mutation goes through).
		const edited = {
			...table,
			bodyRows: [
				["Ada", "30"],
				["Grace-with-a-very-long-name", "40"],
			],
		};
		const serialized = serializeTable(edited);
		const lines = serialized.split("\n");
		const pipeIndices = lines.map((line) => line.indexOf("|"));
		const lastPipeIndices = lines.map((line) => line.lastIndexOf("|"));

		assert.ok(pipeIndices.every((index) => index === pipeIndices[0]));
		assert.ok(lastPipeIndices.every((index) => index === lastPipeIndices[0]));

		const lineLengths = new Set(lines.map((line) => line.length));

		assert.equal(lineLengths.size, 1);
	}
);

check("insertRow: above inserts before the referenced row", () => {
	const table = {
		alignments: [TableAlignment.None],
		bodyRows: [["row-1"], ["row-2"]],
		headerCells: ["header"],
	};
	// logicalRowIndex 2 === bodyRows[1] ("row-2"); inserting "above" it must
	// land the new blank row between "row-1" and "row-2".
	const withRowAbove = insertRow(table, 2, TableInsertPosition.Before);

	assert.deepEqual(withRowAbove.bodyRows, [["row-1"], [""], ["row-2"]]);
});

check("insertRow: below inserts after the referenced row", () => {
	const table = {
		alignments: [TableAlignment.None],
		bodyRows: [["row-1"], ["row-2"]],
		headerCells: ["header"],
	};
	const withRowBelow = insertRow(table, 1, TableInsertPosition.After);

	assert.deepEqual(withRowBelow.bodyRows, [["row-1"], [""], ["row-2"]]);
});

check(
	"deleteRow removes a body row and promotes the first body row when deleting the header",
	() => {
		const table = buildEmptyTable(3, 2);
		const populated = {
			...table,
			bodyRows: [
				["a1", "a2"],
				["b1", "b2"],
			],
			headerCells: ["h1", "h2"],
		};
		const withoutBodyRow = deleteRow(populated, 1);

		assert.deepEqual(withoutBodyRow.bodyRows, [["b1", "b2"]]);

		const withoutHeader = deleteRow(populated, 0);

		assert.deepEqual(withoutHeader.headerCells, ["a1", "a2"]);
		assert.deepEqual(withoutHeader.bodyRows, [["b1", "b2"]]);
	}
);

check("insertColumn: left inserts before the referenced column", () => {
	const table = {
		alignments: [TableAlignment.None, TableAlignment.None],
		bodyRows: [["a1", "a2"]],
		headerCells: ["h1", "h2"],
	};
	const withColumnLeft = insertColumn(table, 1, TableInsertPosition.Before);

	assert.deepEqual(withColumnLeft.headerCells, ["h1", "", "h2"]);
	assert.deepEqual(withColumnLeft.bodyRows, [["a1", "", "a2"]]);
	assert.deepEqual(withColumnLeft.alignments, [
		TableAlignment.None,
		TableAlignment.None,
		TableAlignment.None,
	]);
});

check("insertColumn: right inserts after the referenced column", () => {
	const table = {
		alignments: [TableAlignment.None, TableAlignment.None],
		bodyRows: [["a1", "a2"]],
		headerCells: ["h1", "h2"],
	};
	const withColumnRight = insertColumn(table, 0, TableInsertPosition.After);

	assert.deepEqual(withColumnRight.headerCells, ["h1", "", "h2"]);
	assert.deepEqual(withColumnRight.bodyRows, [["a1", "", "a2"]]);
});

check(
	"deleteColumn removes the targeted column and refuses to delete the last one",
	() => {
		const table = buildEmptyTable(2, 2);
		const withColumn = insertColumn(table, 0, TableInsertPosition.After);
		const withoutColumn = deleteColumn(withColumn, 1);

		assert.equal(withoutColumn.headerCells.length, 2);

		const cannotDeleteLastColumn = deleteColumn(buildEmptyTable(2, 1), 0);

		assert.equal(cannotDeleteLastColumn.headerCells.length, 1);
	}
);

check(
	"toggleHeaderPresence swaps the header row with the first body row",
	() => {
		const table = {
			alignments: [TableAlignment.None],
			bodyRows: [["body-1"], ["body-2"]],
			headerCells: ["header"],
		};
		const toggled = toggleHeaderPresence(table);

		assert.deepEqual(toggled.headerCells, ["body-1"]);
		assert.deepEqual(toggled.bodyRows, [["header"], ["body-2"]]);

		// Toggling back moves the (now) header content back into the body.
		const toggledAgain = toggleHeaderPresence(toggled);

		assert.deepEqual(toggledAgain, table);
	}
);

check("setColumnAlignment only changes the targeted column", () => {
	const table = buildEmptyTable(2, 3);
	const aligned = setColumnAlignment(table, 1, TableAlignment.Center);

	assert.deepEqual(aligned.alignments, [
		TableAlignment.None,
		TableAlignment.Center,
		TableAlignment.None,
	]);
});

check(
	"getNextCellPosition/getPreviousCellPosition wrap across rows and stop at the edges",
	() => {
		const table = buildEmptyTable(2, 2);

		assert.deepEqual(getNextCellPosition(table, { column: 0, row: 0 }), {
			column: 1,
			row: 0,
		});
		assert.deepEqual(getNextCellPosition(table, { column: 1, row: 0 }), {
			column: 0,
			row: 1,
		});
		assert.equal(getNextCellPosition(table, { column: 1, row: 1 }), null);

		assert.deepEqual(getPreviousCellPosition(table, { column: 1, row: 0 }), {
			column: 0,
			row: 0,
		});
		assert.deepEqual(getPreviousCellPosition(table, { column: 0, row: 1 }), {
			column: 1,
			row: 0,
		});
		assert.equal(getPreviousCellPosition(table, { column: 0, row: 0 }), null);
	}
);

check(
	"isLastTableRow + insertRow(After) is what Tab/Enter use to append a row from the last row",
	() => {
		const table = buildEmptyTable(2, 2);
		const lastRowPosition = { column: 1, row: 1 };

		assert.equal(isLastTableRow(table, lastRowPosition), true);
		assert.equal(getNextCellPosition(table, lastRowPosition), null);

		const withAppendedRow = insertRow(
			table,
			lastRowPosition.row,
			TableInsertPosition.After
		);

		assert.equal(withAppendedRow.bodyRows.length, table.bodyRows.length + 1);
		assert.equal(isLastTableRow(table, { column: 0, row: 0 }), false);
	}
);

process.stdout.write(`${results.join("\n")}\n`);
process.stdout.write(`\n${results.length} checks passed.\n`);
