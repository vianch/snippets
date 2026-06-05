import { ReactElement } from "react";

import { EditorView } from "@codemirror/view";

declare global {
	type MarkdownToolbarAction = {
		apply: (view: EditorView) => void;
		hasDividerBefore?: boolean;
		icon: (iconProps: Icon) => ReactElement;
		label: string;
	};

	type LinePrefixTransform = {
		addToLine: (lineText: string, indexWithinSelection: number) => string;
		isLinePrefixed: (lineText: string) => boolean;
		removeFromLine: (lineText: string) => string;
	};
}
