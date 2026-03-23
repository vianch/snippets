import { codeToHtml } from "shiki";

import { ThemeName, ThemeNames } from "./themes";

const shikiThemeMap: Record<ThemeName, string> = {
	[ThemeNames.AyuLight]: "ayu-light",
	[ThemeNames.CatppuccinLatte]: "catppuccin-latte",
	[ThemeNames.Dracula]: "dracula",
	[ThemeNames.GithubDark]: "github-dark",
	[ThemeNames.GithubLight]: "github-light",
	// Shiki has no shades-of-purple bundle; material-theme-palenight is the closest dark-purple equivalent
	[ThemeNames.ShadesOfPurple]: "material-theme-palenight",
};

const shikiLanguageMap: Record<string, string> = {
	JavaScript: "javascript",
	TypeScript: "typescript",
	bash: "bash",
	c: "c",
	cpp: "cpp",
	css: "css",
	dart: "dart",
	go: "go",
	html: "html",
	java: "java",
	json: "json",
	kotlin: "kotlin",
	markdown: "markdown",
	php: "php",
	python: "python",
	ruby: "ruby",
	rust: "rust",
	sql: "sql",
	swift: "swift",
	yaml: "yaml",
};

export const getHighlightedCode = async (
	code: string,
	language: string,
	theme: ThemeName
): Promise<string> => {
	const shikiLanguage = shikiLanguageMap[language] ?? "plaintext";
	const shikiTheme = shikiThemeMap[theme] ?? "dracula";

	return codeToHtml(code, {
		lang: shikiLanguage,
		theme: shikiTheme,
	});
};
