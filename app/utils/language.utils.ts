import { languageAbbreviations } from "@/lib/config/languages";

export const getLanguageAbbreviation = (language: string): string =>
	languageAbbreviations[language] ?? language.slice(0, 3).toUpperCase();
