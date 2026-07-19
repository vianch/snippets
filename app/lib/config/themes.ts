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
	CatppuccinFrappe: "catppuccin-frappe",
	CatppuccinMacchiato: "catppuccin-macchiato",
	CatppuccinMocha: "catppuccin-mocha",
	GithubDark: "github-dark",
	GithubLight: "github-light",
	QuietGreen: "quiet-green",
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
	{
		name: ThemeNames.QuietGreen,
		label: "Quiet Green",
		isDark: false,
		previewColors: {
			bg: "#dbe7d7",
			sidebar: "#cdddc9",
			accent: "#e0705f",
			text: "#2d4a3e",
		},
	},
	{
		name: ThemeNames.CatppuccinFrappe,
		label: "Catppuccin Frappé",
		isDark: true,
		previewColors: {
			bg: "#303446",
			sidebar: "#292c3c",
			accent: "#ca9ee6",
			text: "#c6d0f5",
		},
	},
	{
		name: ThemeNames.CatppuccinMacchiato,
		label: "Catppuccin Macchiato",
		isDark: true,
		previewColors: {
			bg: "#24273a",
			sidebar: "#1e2030",
			accent: "#c6a0f6",
			text: "#cad3f5",
		},
	},
	{
		name: ThemeNames.CatppuccinMocha,
		label: "Catppuccin Mocha",
		isDark: true,
		previewColors: {
			bg: "#1e1e2e",
			sidebar: "#181825",
			accent: "#cba6f7",
			text: "#cdd6f4",
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

const catppuccinFrappeTheme = createTheme({
	theme: "dark",
	settings: {
		background: "#303446",
		foreground: "#c6d0f5",
		caret: "#f2d5cf",
		selection: "#babbf133",
		selectionMatch: "#babbf122",
		lineHighlight: "#292c3c",
		gutterBackground: "#303446",
		gutterForeground: "#838ba7",
		gutterActiveForeground: "#c6d0f5",
		gutterBorder: "transparent",
		...codeMirrorSettings,
	},
	styles: [
		{ tag: tags.comment, color: "#838ba7" },
		{ tag: tags.keyword, color: "#ca9ee6" },
		{ tag: [tags.string, tags.special(tags.brace)], color: "#a6d189" },
		{ tag: tags.number, color: "#ef9f76" },
		{ tag: tags.bool, color: "#ef9f76" },
		{ tag: tags.null, color: "#ef9f76" },
		{
			tag: [
				tags.definition(tags.variableName),
				tags.function(tags.variableName),
			],
			color: "#8caaee",
		},
		{ tag: tags.variableName, color: "#c6d0f5" },
		{ tag: tags.typeName, color: "#e5c890" },
		{ tag: tags.propertyName, color: "#8caaee" },
		{ tag: tags.operator, color: "#81c8be" },
		{ tag: tags.punctuation, color: "#a5adce" },
		{ tag: tags.tagName, color: "#e78284" },
		{ tag: tags.attributeName, color: "#e5c890" },
	],
});

const catppuccinMacchiatoTheme = createTheme({
	theme: "dark",
	settings: {
		background: "#24273a",
		foreground: "#cad3f5",
		caret: "#f4dbd6",
		selection: "#b7bdf833",
		selectionMatch: "#b7bdf822",
		lineHighlight: "#1e2030",
		gutterBackground: "#24273a",
		gutterForeground: "#8087a2",
		gutterActiveForeground: "#cad3f5",
		gutterBorder: "transparent",
		...codeMirrorSettings,
	},
	styles: [
		{ tag: tags.comment, color: "#8087a2" },
		{ tag: tags.keyword, color: "#c6a0f6" },
		{ tag: [tags.string, tags.special(tags.brace)], color: "#a6da95" },
		{ tag: tags.number, color: "#f5a97f" },
		{ tag: tags.bool, color: "#f5a97f" },
		{ tag: tags.null, color: "#f5a97f" },
		{
			tag: [
				tags.definition(tags.variableName),
				tags.function(tags.variableName),
			],
			color: "#8aadf4",
		},
		{ tag: tags.variableName, color: "#cad3f5" },
		{ tag: tags.typeName, color: "#eed49f" },
		{ tag: tags.propertyName, color: "#8aadf4" },
		{ tag: tags.operator, color: "#8bd5ca" },
		{ tag: tags.punctuation, color: "#a5adcb" },
		{ tag: tags.tagName, color: "#ed8796" },
		{ tag: tags.attributeName, color: "#eed49f" },
	],
});

const catppuccinMochaTheme = createTheme({
	theme: "dark",
	settings: {
		background: "#1e1e2e",
		foreground: "#cdd6f4",
		caret: "#f5e0dc",
		selection: "#b4befe33",
		selectionMatch: "#b4befe22",
		lineHighlight: "#181825",
		gutterBackground: "#1e1e2e",
		gutterForeground: "#7f849c",
		gutterActiveForeground: "#cdd6f4",
		gutterBorder: "transparent",
		...codeMirrorSettings,
	},
	styles: [
		{ tag: tags.comment, color: "#7f849c" },
		{ tag: tags.keyword, color: "#cba6f7" },
		{ tag: [tags.string, tags.special(tags.brace)], color: "#a6e3a1" },
		{ tag: tags.number, color: "#fab387" },
		{ tag: tags.bool, color: "#fab387" },
		{ tag: tags.null, color: "#fab387" },
		{
			tag: [
				tags.definition(tags.variableName),
				tags.function(tags.variableName),
			],
			color: "#89b4fa",
		},
		{ tag: tags.variableName, color: "#cdd6f4" },
		{ tag: tags.typeName, color: "#f9e2af" },
		{ tag: tags.propertyName, color: "#89b4fa" },
		{ tag: tags.operator, color: "#94e2d5" },
		{ tag: tags.punctuation, color: "#a6adc8" },
		{ tag: tags.tagName, color: "#f38ba8" },
		{ tag: tags.attributeName, color: "#f9e2af" },
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

const quietGreenTheme = createTheme({
	theme: "light",
	settings: {
		background: "#dbe7d7",
		foreground: "#2d4a3e",
		caret: "#e0705f",
		selection: "#4a7c5933",
		selectionMatch: "#4a7c5922",
		lineHighlight: "#cdddc9",
		gutterBackground: "#dbe7d7",
		gutterForeground: "#7d9080",
		gutterActiveForeground: "#2d4a3e",
		gutterBorder: "transparent",
		...codeMirrorSettings,
	},
	styles: [
		{ tag: tags.comment, color: "#8a9c8d" },
		{ tag: tags.keyword, color: "#2f8a7d" },
		{ tag: [tags.string, tags.special(tags.brace)], color: "#6f8f3f" },
		{ tag: tags.number, color: "#c2922f" },
		{ tag: tags.bool, color: "#c2922f" },
		{ tag: tags.null, color: "#c2922f" },
		{
			tag: [
				tags.definition(tags.variableName),
				tags.function(tags.variableName),
			],
			color: "#3f7d8f",
		},
		{ tag: tags.variableName, color: "#2d4a3e" },
		{ tag: tags.typeName, color: "#b07a3c" },
		{ tag: tags.propertyName, color: "#3f7d8f" },
		{ tag: tags.operator, color: "#2f8a7d" },
		{ tag: tags.punctuation, color: "#617066" },
		{ tag: tags.tagName, color: "#e0705f" },
		{ tag: tags.attributeName, color: "#c2922f" },
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
	[ThemeNames.CatppuccinFrappe]: catppuccinFrappeTheme,
	[ThemeNames.CatppuccinMacchiato]: catppuccinMacchiatoTheme,
	[ThemeNames.CatppuccinMocha]: catppuccinMochaTheme,
	[ThemeNames.GithubDark]: githubDarkTheme,
	[ThemeNames.GithubLight]: githubLightTheme,
	[ThemeNames.QuietGreen]: quietGreenTheme,
};

export const getCodeMirrorTheme = (themeName: ThemeName): Extension =>
	codeMirrorThemes[themeName] ?? codeMirrorThemes[ThemeNames.ShadesOfPurple];

export const isValidTheme = (theme: string): theme is ThemeName =>
	themeList.some((t) => t.name === theme);
