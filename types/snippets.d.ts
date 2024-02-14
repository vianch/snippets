import { LanguageSupport } from "@codemirror/language";

import SupportedLanguages from "@/lib/config/languages";

type Tags = string[];

declare global {
	interface Snippet {
		id: string;
		createdAt: string;
		updatedAt: string;
		deletedAt?: string;
		name: string;
		url: string;
		notes: string;
		snippet: string;
		language: SupportedLanguages;
		tags?: Tags;
	}

	type LanguageExtensions = {
		[key: SupportedLanguages | string]: LanguageSupport;
	};
}
