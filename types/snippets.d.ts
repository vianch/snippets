import { LanguageSupport } from "@codemirror/language";

import SupportedLanguages from "@/lib/config/languages";
import { MenuItems } from "@/lib/constants/core";

declare global {
	type Tags = string | null;
	type UUID = string & { __uuid: undefined };

	type SnippetState = "active" | "inactive" | "favorite";

	type MenuItemType = MenuItems | string;

	type SnippetEditorStates = {
		activeSnippetId: UUID | null;
		isSaving: boolean;
		touched: boolean;
		menuType: MenuItemType;
	};

	interface Snippet {
		snippet_id: UUID;
		user_id: UUID;
		created_at: string;
		updated_at: string;
		name: string;
		url: string | null;
		notes: string | null;
		snippet: string;
		language: SupportedLanguages;
		state: SnippetState;
		tags?: Tags;
		is_public: boolean;
		public_slug: string | null;
	}

	interface SnippetVersion {
		version_id: UUID;
		snippet_id: UUID;
		user_id: UUID;
		content: string;
		language: string;
		name: string;
		tags: Tags;
		version_number: number;
		created_at: string;
	}

	interface CurrentSnippet extends Snippet {
		extension: LanguageSupport;
	}

	type LanguageExtensions = {
		[key: SupportedLanguages | string]: LanguageSupport;
	};

	type DeleteRestoreFunction = (snippetId: UUID, state: SnippetState) => void;

	type SearchData = {
		searchQuery: string;
		originalSnippets: Snippet[];
		snippetsFound: Snippet[];
	};

	type SnippetItemProps = {
		codeEditorStates: SnippetEditorStates;
		onActiveSnippet: (snippetId: UUID) => void;
		onDeleteSnippet: DeleteRestoreFunction;
		onRestoreSnippet: DeleteRestoreFunction;
	};

	type AiProvider = "ollama" | "claude" | "openai";

	type AiAction =
		| "explain"
		| "comments"
		| "format"
		| "optimize"
		| "json"
		| "ask"
		| "complete";

	type AiRequest = {
		action: AiAction;
		code: string;
		language: string;
		userPrompt?: string;
	};

	type AiResponse = {
		result: string;
		provider: AiProvider;
	};
}
