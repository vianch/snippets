import SupportedLanguages from "@/lib/config/languages";

const languageAbbreviations: Record<string, string> = {
	[SupportedLanguages.Markdown]: "MD",
	[SupportedLanguages.Bash]: "SH",
	[SupportedLanguages.C]: "C",
	[SupportedLanguages.Cpp]: "C++",
	[SupportedLanguages.CSS]: "CSS",
	[SupportedLanguages.Dart]: "DAR",
	[SupportedLanguages.Go]: "GO",
	[SupportedLanguages.HTML]: "HTML",
	[SupportedLanguages.Java]: "JAV",
	[SupportedLanguages.JavaScript]: "JS",
	[SupportedLanguages.JSON]: "JSON",
	[SupportedLanguages.Kotlin]: "KT",
	[SupportedLanguages.PHP]: "PHP",
	[SupportedLanguages.Python]: "PY",
	[SupportedLanguages.Ruby]: "RB",
	[SupportedLanguages.Rust]: "RS",
	[SupportedLanguages.SQL]: "SQL",
	[SupportedLanguages.Swift]: "SWT",
	[SupportedLanguages.TypeScript]: "TS",
	[SupportedLanguages.YAML]: "YML",
};

export const getLanguageAbbreviation = (language: string): string =>
	languageAbbreviations[language] ?? language.slice(0, 3).toUpperCase();

export default languageAbbreviations;
