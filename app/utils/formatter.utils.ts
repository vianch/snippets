import SupportedLanguages from "@/lib/config/languages";
import parserMap from "@/lib/constants/formatter";

export const isFormattableLanguage = (language: SupportedLanguages): boolean =>
	language in parserMap;

export const formatCode = async (
	code: string,
	language: SupportedLanguages
): Promise<string> => {
	const config = parserMap[language];

	if (!config) {
		return code;
	}

	const prettier = await import("prettier/standalone");
	const plugins = await Promise.all(config.plugins.map((p) => p()));

	return prettier.format(code, {
		parser: config.parser,
		plugins,
		useTabs: true,
		tabWidth: 2,
		semi: true,
		singleQuote: false,
		trailingComma: "es5",
		printWidth: 80,
	});
};
