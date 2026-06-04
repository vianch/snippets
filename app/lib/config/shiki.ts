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

// Maps lowercase markdown fence info-strings (```js, ```ts, ```bash, …) and
// their common aliases to the shiki grammar id used to highlight the block.
const markdownFenceLanguageMap: Record<string, string> = {
	bash: "bash",
	css: "css",
	go: "go",
	golang: "go",
	javascript: "javascript",
	js: "javascript",
	json: "json",
	jsx: "javascript",
	py: "python",
	python: "python",
	rb: "ruby",
	rs: "rust",
	ruby: "ruby",
	rust: "rust",
	sh: "bash",
	shell: "bash",
	shellscript: "bash",
	sql: "sql",
	ts: "typescript",
	tsx: "typescript",
	typescript: "typescript",
	zsh: "bash",
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

export const getHighlightedFenceCode = async (
	code: string,
	fenceLanguage: string,
	theme: ThemeName
): Promise<string | null> => {
	const shikiLanguage = markdownFenceLanguageMap[fenceLanguage];

	if (!shikiLanguage) {
		return null;
	}

	const shikiTheme = shikiThemeMap[theme] ?? "dracula";

	try {
		return await codeToHtml(code, {
			lang: shikiLanguage,
			theme: shikiTheme,
		});
	} catch {
		return null;
	}
};
