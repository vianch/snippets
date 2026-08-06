import type { EditorView } from "@codemirror/view";

/* Components */
import TableIcon from "@/components/ui/icons/Table";

/* Lib */
import { TableRowLineBreak } from "@/lib/constants/table.constants";
import {
	computeSerializedCellSelection,
	getCurrentTableRange,
} from "@/lib/markdown/tableEditor";
import { buildEmptyTable, serializeTable } from "@/utils/table.utils";

const insertTable = (view: EditorView): void => {
	// Only a fresh insert is exposed in the toolbar: inside an existing table
	// rows are added through Tab/Enter navigation instead.
	if (getCurrentTableRange(view) !== null) {
		return;
	}

	const cursorLine = view.state.doc.lineAt(view.state.selection.main.head);
	const insertionPrefix = cursorLine.text.length > 0 ? TableRowLineBreak : "";
	const serializedText = serializeTable(buildEmptyTable());
	const insertFrom = cursorLine.to;
	const textOffset = insertFrom + insertionPrefix.length;
	const { anchor, head } = computeSerializedCellSelection(serializedText, {
		column: 0,
		row: 0,
	});

	view.dispatch({
		changes: {
			from: insertFrom,
			insert: `${insertionPrefix}${serializedText}`,
		},
		selection: { anchor: textOffset + anchor, head: textOffset + head },
	});
	view.focus();
};

export const insertTableAction: MarkdownToolbarAction = {
	apply: insertTable,
	hasDividerBefore: true,
	icon: TableIcon,
	label: "Insert table",
};
