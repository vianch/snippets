import { LanguageSupport } from "@codemirror/language";

import SupportedLanguages from "@/lib/config/languages";

declare global {
	type Tags = string[];
	type UUID = string & { __uuid: undefined };

	type SnippetState = "active" | "inactive";

	type MenuItemType = "all" | "trash" | "favorites";

	type SnippetEditorStates = {
		activeSnippetIndex: number;
		isSaving: boolean;
		touched: boolean;
		menuType: MenuItemType;
	};

	interface Snippet {
		snippet_id: UUID;
		user_id: UUID;
		created_at: string;
		updated_at: string;
		name: string | null;
		url: string | null;
		notes: string | null;
		snippet: string;
		language: SupportedLanguages;
		state: SnippetState;
		tags?: Tags;
	}

	interface CurrentSnippet extends Snippet {
		extension: LanguageSupport;
	}

	type LanguageExtensions = {
		[key: SupportedLanguages | string]: LanguageSupport;
	};
}
