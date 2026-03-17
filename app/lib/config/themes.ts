import { Extension } from "@codemirror/state";
import { draculaInit } from "@uiw/codemirror-theme-dracula";
import { githubDarkInit, githubLightInit } from "@uiw/codemirror-theme-github";
import { createTheme } from "@uiw/codemirror-themes";
import { tags } from "@lezer/highlight";

export const ThemeNames = {
	Dracula: "dracula",
	ShadesOfPurple: "shades-of-purple",
	CatppuccinLatte: "catppuccin-latte",
	AyuLight: "ayu-light",
	GithubDark: "github-dark",
	GithubLight: "github-light",
} as const;

export type ThemeName = (typeof ThemeNames)[keyof typeof ThemeNames];

export type ThemeConfig = {
	name: ThemeName;
	label: string;
	isDark: boolean;
	previewColors: {
		bg: string;
		sidebar: string;
		accent: string;
		text: string;
	};
};

export const themeList: ThemeConfig[] = [
	{
		name: ThemeNames.Dracula,
		label: "Dracula",
		isDark: true,
		previewColors: {
			bg: "#282a36",
			sidebar: "#363945",
			accent: "#bd93f9",
			text: "#f8f8f2",
		},
	},
	{
		name: ThemeNames.ShadesOfPurple,
		label: "Shades of Purple",
		isDark: true,
		previewColors: {
			bg: "#1E1E3F",
			sidebar: "#2D2B55",
			accent: "#A599E9",
			text: "#A599E9",
		},
	},
	{
		name: ThemeNames.CatppuccinLatte,
		label: "Catppuccin Latte",
		isDark: false,
		previewColors: {
			bg: "#eff1f5",
			sidebar: "#e6e9ef",
			accent: "#8839ef",
			text: "#4c4f69",
		},
	},
	{
		name: ThemeNames.AyuLight,
		label: "Ayu Light",
		isDark: false,
		previewColors: {
			bg: "#fafafa",
			sidebar: "#f0f0f0",
			accent: "#ff9940",
			text: "#575f66",
		},
	},
	{
		name: ThemeNames.GithubDark,
		label: "GitHub Dark",
		isDark: true,
		previewColors: {
			bg: "#0d1117",
			sidebar: "#161b22",
			accent: "#d2a8ff",
			text: "#e6edf3",
		},
	},
	{
		name: ThemeNames.GithubLight,
		label: "GitHub Light",
		isDark: false,
		previewColors: {
			bg: "#ffffff",
			sidebar: "#f6f8fa",
			accent: "#8250df",
			text: "#1f2328",
		},
	},
];

// --- CodeMirror Themes ---

const codeMirrorSettings = {
	fontFamily: "monospace",
};

const draculaTheme = draculaInit({
	settings: {
		background: "#363945",
		...codeMirrorSettings,
	},
});

const shadesOfPurpleTheme = createTheme({
	theme: "dark",
	settings: {
		background: "#2D2B55",
		foreground: "#A599E9",
		caret: "#FAD000",
		selection: "#A599E950",
		selectionMatch: "#A599E930",
		lineHighlight: "#ffffff08",
		gutterBackground: "#2D2B55",
		gutterForeground: "#A599E9",
		gutterActiveForeground: "#FAD000",
		gutterBorder: "transparent",
		...codeMirrorSettings,
	},
	styles: [
		{ tag: tags.comment, color: "#B362FF" },
		{ tag: tags.keyword, color: "#FF9D00" },
		{ tag: [tags.string, tags.special(tags.brace)], color: "#A5FF90" },
		{ tag: tags.number, color: "#FF628C" },
		{ tag: tags.bool, color: "#FF628C" },
		{ tag: tags.null, color: "#FF628C" },
		{
			tag: [
				tags.definition(tags.variableName),
				tags.function(tags.variableName),
			],
			color: "#FB94FF",
		},
		{ tag: tags.variableName, color: "#9EFFFF" },
		{ tag: tags.typeName, color: "#FB94FF" },
		{ tag: tags.propertyName, color: "#9EFFFF" },
		{ tag: tags.operator, color: "#FF9D00" },
		{ tag: tags.punctuation, color: "#A599E9" },
		{ tag: tags.tagName, color: "#FF628C" },
		{ tag: tags.attributeName, color: "#FAD000" },
	],
});

const catppuccinLatteTheme = createTheme({
	theme: "light",
	settings: {
		background: "#eff1f5",
		foreground: "#4c4f69",
		caret: "#dc8a78",
		selection: "#7287fd33",
		selectionMatch: "#7287fd22",
		lineHighlight: "#e6e9ef",
		gutterBackground: "#eff1f5",
		gutterForeground: "#8c8fa1",
		gutterActiveForeground: "#4c4f69",
		gutterBorder: "transparent",
		...codeMirrorSettings,
	},
	styles: [
		{ tag: tags.comment, color: "#8c8fa1" },
		{ tag: tags.keyword, color: "#8839ef" },
		{ tag: [tags.string, tags.special(tags.brace)], color: "#40a02b" },
		{ tag: tags.number, color: "#fe640b" },
		{ tag: tags.bool, color: "#fe640b" },
		{ tag: tags.null, color: "#fe640b" },
		{
			tag: [
				tags.definition(tags.variableName),
				tags.function(tags.variableName),
			],
			color: "#1e66f5",
		},
		{ tag: tags.variableName, color: "#4c4f69" },
		{ tag: tags.typeName, color: "#df8e1d" },
		{ tag: tags.propertyName, color: "#1e66f5" },
		{ tag: tags.operator, color: "#179299" },
		{ tag: tags.punctuation, color: "#6c6f85" },
		{ tag: tags.tagName, color: "#d20f39" },
		{ tag: tags.attributeName, color: "#df8e1d" },
	],
});

const ayuLightTheme = createTheme({
	theme: "light",
	settings: {
		background: "#fafafa",
		foreground: "#575f66",
		caret: "#ff9940",
		selection: "#035bd626",
		selectionMatch: "#035bd615",
		lineHighlight: "#f0f0f0",
		gutterBackground: "#fafafa",
		gutterForeground: "#aaaaaa",
		gutterActiveForeground: "#575f66",
		gutterBorder: "transparent",
		...codeMirrorSettings,
	},
	styles: [
		{ tag: tags.comment, color: "#aaaaaa" },
		{ tag: tags.keyword, color: "#ff9940" },
		{ tag: [tags.string, tags.special(tags.brace)], color: "#86b300" },
		{ tag: tags.number, color: "#ff9940" },
		{ tag: tags.bool, color: "#ff9940" },
		{ tag: tags.null, color: "#ff9940" },
		{
			tag: [
				tags.definition(tags.variableName),
				tags.function(tags.variableName),
			],
			color: "#f2ae49",
		},
		{ tag: tags.variableName, color: "#575f66" },
		{ tag: tags.typeName, color: "#ed9366" },
		{ tag: tags.propertyName, color: "#1b7dc4" },
		{ tag: tags.operator, color: "#ed9366" },
		{ tag: tags.punctuation, color: "#575f66" },
		{ tag: tags.tagName, color: "#f07171" },
		{ tag: tags.attributeName, color: "#ed9366" },
	],
});

const githubDarkTheme = githubDarkInit({
	settings: {
		background: "#161b22",
		...codeMirrorSettings,
	},
});

const githubLightTheme = githubLightInit({
	settings: {
		background: "#ffffff",
		...codeMirrorSettings,
	},
});

const codeMirrorThemes: Record<ThemeName, Extension> = {
	[ThemeNames.Dracula]: draculaTheme,
	[ThemeNames.ShadesOfPurple]: shadesOfPurpleTheme,
	[ThemeNames.CatppuccinLatte]: catppuccinLatteTheme,
	[ThemeNames.AyuLight]: ayuLightTheme,
	[ThemeNames.GithubDark]: githubDarkTheme,
	[ThemeNames.GithubLight]: githubLightTheme,
};

export const getCodeMirrorTheme = (themeName: ThemeName): Extension =>
	codeMirrorThemes[themeName] ?? codeMirrorThemes[ThemeNames.Dracula];

export const isValidTheme = (theme: string): theme is ThemeName =>
	themeList.some((t) => t.name === theme);
