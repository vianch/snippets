import { Extension, StateEffect, StateField } from "@codemirror/state";
import {
	Decoration,
	DecorationSet,
	EditorView,
	ViewUpdate,
	WidgetType,
	keymap,
} from "@codemirror/view";

type Suggestion = {
	text: string;
	from: number;
};

type InlineCompletionOptions = {
	fetchCompletion: (prefix: string, language: string) => Promise<string>;
	language: string;
	enabled: boolean;
};

const setSuggestion = StateEffect.define<Suggestion | null>();

class GhostTextWidget extends WidgetType {
	constructor(readonly text: string) {
		super();
	}

	toDOM(): HTMLSpanElement {
		const span = document.createElement("span");

		span.className = "cm-ghost-text";
		span.textContent = this.text;

		return span;
	}

	eq(other: GhostTextWidget): boolean {
		return other.text === this.text;
	}
}

const buildDecorations = (value: Suggestion | null): DecorationSet => {
	if (!value || !value.text) {
		return Decoration.none;
	}

	return Decoration.set([
		Decoration.widget({
			widget: new GhostTextWidget(value.text),
			side: 1,
		}).range(value.from),
	]);
};

const suggestionField = StateField.define<Suggestion | null>({
	create: () => null,
	update(value, transaction) {
		for (const effect of transaction.effects) {
			if (effect.is(setSuggestion)) {
				return effect.value;
			}
		}

		if (transaction.docChanged || transaction.selection) {
			return null;
		}

		return value;
	},
	provide: (field) => EditorView.decorations.from(field, buildDecorations),
});

const acceptSuggestion = (view: EditorView): boolean => {
	const suggestion = view.state.field(suggestionField, false);

	if (!suggestion || !suggestion.text) {
		return false;
	}

	view.dispatch({
		changes: { from: suggestion.from, insert: suggestion.text },
		selection: { anchor: suggestion.from + suggestion.text.length },
		effects: setSuggestion.of(null),
	});

	return true;
};

const dismissSuggestion = (view: EditorView): boolean => {
	const suggestion = view.state.field(suggestionField, false);

	if (!suggestion) {
		return false;
	}

	view.dispatch({ effects: setSuggestion.of(null) });

	return true;
};

const inlineCompletion = (options: InlineCompletionOptions): Extension => {
	let inFlight = false;

	const requestCompletion = (view: EditorView): boolean => {
		if (!options.enabled || inFlight) {
			return true;
		}

		const cursorPosition = view.state.selection.main.head;
		const prefix = view.state.doc.sliceString(0, cursorPosition);

		if (prefix.trim().length === 0) {
			return true;
		}

		inFlight = true;

		options
			.fetchCompletion(prefix, options.language)
			.then((text) => {
				const cleaned = text.trim();

				if (!cleaned) {
					return;
				}

				view.dispatch({
					effects: setSuggestion.of({ text: cleaned, from: cursorPosition }),
				});
			})
			.catch(() => {
				/* swallow — the ghost text just won't appear */
			})
			.finally(() => {
				inFlight = false;
			});

		return true;
	};

	return [
		suggestionField,
		keymap.of([
			{ key: "Tab", run: acceptSuggestion },
			{ key: "Escape", run: dismissSuggestion },
			{ key: "Mod-Shift-i", run: requestCompletion, preventDefault: true },
		]),
		EditorView.updateListener.of((update: ViewUpdate) => {
			if (update.docChanged || update.selectionSet) {
				const current = update.state.field(suggestionField, false);

				if (current) {
					update.view.dispatch({ effects: setSuggestion.of(null) });
				}
			}
		}),
	];
};

export default inlineCompletion;
