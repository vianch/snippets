import type { Line } from "@codemirror/state";
import type { EditorView } from "@codemirror/view";

/* Components */
import Bold from "@/components/ui/icons/Bold";
import Code from "@/components/ui/icons/Code";
import CodeBlock from "@/components/ui/icons/CodeBlock";
import Heading from "@/components/ui/icons/Heading";
import Italic from "@/components/ui/icons/Italic";
import Link from "@/components/ui/icons/Link";
import List from "@/components/ui/icons/List";
import ListChecks from "@/components/ui/icons/ListChecks";
import ListNumbers from "@/components/ui/icons/ListNumbers";
import Quote from "@/components/ui/icons/Quote";

/* Lib */
import {
	blockquotePrefix,
	boldMarker,
	boldPlaceholder,
	bulletListPrefix,
	checklistPrefix,
	codeBlockPlaceholder,
	codeFenceMarker,
	headingMarker,
	headingPattern,
	headingSeparator,
	inlineCodeMarker,
	inlineCodePlaceholder,
	italicMarker,
	italicPlaceholder,
	linkSyntaxPattern,
	linkTextPlaceholder,
	linkUrlPlaceholder,
	maximumHeadingLevel,
	numberedListPattern,
} from "@/lib/constants/markdown.constants";

const getSelectedLines = (view: EditorView): Line[] => {
	const { from, to } = view.state.selection.main;
	const startLine = view.state.doc.lineAt(from);
	const endLine = view.state.doc.lineAt(to);
	const lineCount = endLine.number - startLine.number + 1;

	return Array.from({ length: lineCount }, (_unused, index) =>
		view.state.doc.line(startLine.number + index)
	);
};

const replaceSelectedLines = (
	view: EditorView,
	lines: Line[],
	transformedText: string
): void => {
	const firstLine = lines[0];
	const lastLine = lines[lines.length - 1];

	if (!firstLine || !lastLine) {
		return;
	}

	view.dispatch({
		changes: { from: firstLine.from, to: lastLine.to, insert: transformedText },
		selection: {
			anchor: firstLine.from,
			head: firstLine.from + transformedText.length,
		},
	});
	view.focus();
};

const applyLinePrefix = (
	view: EditorView,
	transform: LinePrefixTransform
): void => {
	const lines = getSelectedLines(view);
	const everyLinePrefixed = lines.every((line) =>
		transform.isLinePrefixed(line.text)
	);
	const transformedText = lines
		.map((line, indexWithinSelection) =>
			everyLinePrefixed
				? transform.removeFromLine(line.text)
				: transform.addToLine(line.text, indexWithinSelection)
		)
		.join("\n");

	replaceSelectedLines(view, lines, transformedText);
};

const applyInlineWrap = (
	view: EditorView,
	marker: string,
	placeholder: string
): void => {
	const { from, to, empty } = view.state.selection.main;
	const selectedText = view.state.sliceDoc(from, to);
	const markerLength = marker.length;
	const isSelectionWrapped =
		selectedText.length >= markerLength * 2 &&
		selectedText.startsWith(marker) &&
		selectedText.endsWith(marker);

	if (isSelectionWrapped) {
		const innerText = selectedText.slice(
			markerLength,
			selectedText.length - markerLength
		);

		view.dispatch({
			changes: { from, to, insert: innerText },
			selection: { anchor: from, head: from + innerText.length },
		});
		view.focus();

		return;
	}

	const textBeforeSelection = view.state.sliceDoc(
		Math.max(0, from - markerLength),
		from
	);
	const textAfterSelection = view.state.sliceDoc(
		to,
		Math.min(view.state.doc.length, to + markerLength)
	);
	const isSurroundedByMarker =
		textBeforeSelection === marker && textAfterSelection === marker;

	if (isSurroundedByMarker) {
		view.dispatch({
			changes: [
				{ from: from - markerLength, to: from, insert: "" },
				{ from: to, to: to + markerLength, insert: "" },
			],
			selection: { anchor: from - markerLength, head: to - markerLength },
		});
		view.focus();

		return;
	}

	const innerText = empty ? placeholder : selectedText;
	const wrappedText = `${marker}${innerText}${marker}`;

	view.dispatch({
		changes: { from, to, insert: wrappedText },
		selection: {
			anchor: from + markerLength,
			head: from + markerLength + innerText.length,
		},
	});
	view.focus();
};

const detectHeadingLevel = (lineText: string): number => {
	const headingMatch = lineText.match(headingPattern);

	return headingMatch?.[1]?.length ?? 0;
};

const buildHeadingPrefix = (level: number): string => {
	if (level === 0) {
		return "";
	}

	return `${headingMarker.repeat(level)}${headingSeparator}`;
};

const stripHeading = (lineText: string): string =>
	lineText.replace(headingPattern, "");

export const wrapSelectionWithBold = (view: EditorView): void =>
	applyInlineWrap(view, boldMarker, boldPlaceholder);

export const wrapSelectionWithItalic = (view: EditorView): void =>
	applyInlineWrap(view, italicMarker, italicPlaceholder);

export const wrapSelectionWithInlineCode = (view: EditorView): void =>
	applyInlineWrap(view, inlineCodeMarker, inlineCodePlaceholder);

const wrapSelectionWithCodeBlock = (view: EditorView): void => {
	const { from, to, empty } = view.state.selection.main;
	const selectedText = view.state.sliceDoc(from, to);
	const fencedPrefix = `${codeFenceMarker}\n`;
	const fencedSuffix = `\n${codeFenceMarker}`;
	const isSelectionFenced =
		selectedText.length >= fencedPrefix.length + fencedSuffix.length &&
		selectedText.startsWith(fencedPrefix) &&
		selectedText.endsWith(fencedSuffix);

	if (isSelectionFenced) {
		const innerText = selectedText.slice(
			fencedPrefix.length,
			selectedText.length - fencedSuffix.length
		);

		view.dispatch({
			changes: { from, to, insert: innerText },
			selection: { anchor: from, head: from + innerText.length },
		});
		view.focus();

		return;
	}

	const innerText = empty ? codeBlockPlaceholder : selectedText;
	const fencedText = `${fencedPrefix}${innerText}${fencedSuffix}`;
	const innerStart = from + fencedPrefix.length;

	view.dispatch({
		changes: { from, to, insert: fencedText },
		selection: { anchor: innerStart, head: innerStart + innerText.length },
	});
	view.focus();
};

const wrapSelectionWithLink = (view: EditorView): void => {
	const { from, to, empty } = view.state.selection.main;
	const selectedText = view.state.sliceDoc(from, to);
	const existingLink = selectedText.match(linkSyntaxPattern);

	if (existingLink) {
		const linkText = existingLink[1] ?? "";

		view.dispatch({
			changes: { from, to, insert: linkText },
			selection: { anchor: from, head: from + linkText.length },
		});
		view.focus();

		return;
	}

	const linkText = empty ? linkTextPlaceholder : selectedText;
	const linkPrefix = `[${linkText}](`;
	const linkSyntax = `${linkPrefix}${linkUrlPlaceholder})`;
	const urlStart = from + linkPrefix.length;

	view.dispatch({
		changes: { from, to, insert: linkSyntax },
		selection: { anchor: urlStart, head: urlStart + linkUrlPlaceholder.length },
	});
	view.focus();
};

const cycleHeadingOnLines = (view: EditorView): void => {
	const lines = getSelectedLines(view);
	const currentLevel = detectHeadingLevel(lines[0]?.text ?? "");
	const nextLevel = currentLevel >= maximumHeadingLevel ? 0 : currentLevel + 1;
	const headingPrefix = buildHeadingPrefix(nextLevel);
	const transformedText = lines
		.map((line) => `${headingPrefix}${stripHeading(line.text)}`)
		.join("\n");

	replaceSelectedLines(view, lines, transformedText);
};

const prefixLinesWithBlockquote = (view: EditorView): void =>
	applyLinePrefix(view, {
		addToLine: (lineText) => `${blockquotePrefix}${lineText}`,
		isLinePrefixed: (lineText) => lineText.startsWith(blockquotePrefix),
		removeFromLine: (lineText) => lineText.slice(blockquotePrefix.length),
	});

const prefixLinesWithBulletList = (view: EditorView): void =>
	applyLinePrefix(view, {
		addToLine: (lineText) => `${bulletListPrefix}${lineText}`,
		isLinePrefixed: (lineText) => lineText.startsWith(bulletListPrefix),
		removeFromLine: (lineText) => lineText.slice(bulletListPrefix.length),
	});

const prefixLinesWithNumberedList = (view: EditorView): void =>
	applyLinePrefix(view, {
		addToLine: (lineText, indexWithinSelection) =>
			`${indexWithinSelection + 1}. ${lineText}`,
		isLinePrefixed: (lineText) => numberedListPattern.test(lineText),
		removeFromLine: (lineText) => lineText.replace(numberedListPattern, ""),
	});

const prefixLinesWithChecklist = (view: EditorView): void =>
	applyLinePrefix(view, {
		addToLine: (lineText) => `${checklistPrefix}${lineText}`,
		isLinePrefixed: (lineText) => lineText.startsWith(checklistPrefix),
		removeFromLine: (lineText) => lineText.slice(checklistPrefix.length),
	});

const markdownToolbarActions: MarkdownToolbarAction[] = [
	{ apply: cycleHeadingOnLines, icon: Heading, label: "Heading" },
	{ apply: wrapSelectionWithBold, icon: Bold, label: "Bold" },
	{ apply: wrapSelectionWithItalic, icon: Italic, label: "Italic" },
	{ apply: wrapSelectionWithInlineCode, icon: Code, label: "Inline code" },
	{ apply: wrapSelectionWithCodeBlock, icon: CodeBlock, label: "Code block" },
	{ apply: wrapSelectionWithLink, icon: Link, label: "Link" },
	{
		apply: prefixLinesWithBlockquote,
		hasDividerBefore: true,
		icon: Quote,
		label: "Blockquote",
	},
	{ apply: prefixLinesWithBulletList, icon: List, label: "Bullet list" },
	{
		apply: prefixLinesWithNumberedList,
		icon: ListNumbers,
		label: "Numbered list",
	},
	{ apply: prefixLinesWithChecklist, icon: ListChecks, label: "Checklist" },
];

export default markdownToolbarActions;
