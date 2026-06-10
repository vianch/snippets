import { createHighlighterCore, HighlighterCore } from "shiki/core";
import { createOnigurumaEngine } from "shiki/engine/oniguruma";

import { ThemeName, ThemeNames } from "./themes";

let highlighterPromise: Promise<HighlighterCore> | null = null;

const getHighlighter = (): Promise<HighlighterCore> => {
	if (!highlighterPromise) {
		highlighterPromise = createHighlighterCore({
			engine: createOnigurumaEngine(import("shiki/wasm")),
			themes: [
				import("@shikijs/themes/ayu-light"),
				import("@shikijs/themes/catppuccin-latte"),
				import("@shikijs/themes/dracula"),
				import("@shikijs/themes/github-dark"),
				import("@shikijs/themes/github-light"),
				import("@shikijs/themes/material-theme-palenight"),
			],
			langs: [
				import("@shikijs/langs/bash"),
				import("@shikijs/langs/c"),
				import("@shikijs/langs/cpp"),
				import("@shikijs/langs/css"),
				import("@shikijs/langs/dart"),
				import("@shikijs/langs/go"),
				import("@shikijs/langs/html"),
				import("@shikijs/langs/java"),
				import("@shikijs/langs/javascript"),
				import("@shikijs/langs/json"),
				import("@shikijs/langs/kotlin"),
				import("@shikijs/langs/markdown"),
				import("@shikijs/langs/php"),
				import("@shikijs/langs/python"),
				import("@shikijs/langs/ruby"),
				import("@shikijs/langs/rust"),
				import("@shikijs/langs/sql"),
				import("@shikijs/langs/swift"),
				import("@shikijs/langs/typescript"),
				import("@shikijs/langs/yaml"),
			],
		});
	}

	return highlighterPromise;
};

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
	const highlighter = await getHighlighter();

	return highlighter.codeToHtml(code, {
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
		const highlighter = await getHighlighter();

		return highlighter.codeToHtml(code, {
			lang: shikiLanguage,
			theme: shikiTheme,
		});
	} catch {
		return null;
	}
};
