import { themeList, ThemeName, ThemeNames } from "@/lib/config/themes";

export type SnapshotOptions = {
	background: string;
	fontFamily: string;
	padding: SnapshotPadding;
	showWindowChrome: boolean;
	theme: ThemeName;
};

export type BackgroundPreset = {
	label: string;
	value: string;
};

export type FontOption = {
	googleFamilyParam?: string;
	label: string;
	value: string;
};

export const backgroundPresets: BackgroundPreset[] = [
	{
		label: "Rose",
		value: "linear-gradient(135deg, #ff3cac 0%, #784ba0 50%, #2b86c5 100%)",
	},
	{
		label: "Ocean",
		value: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
	},
	{
		label: "Midnight",
		value: "linear-gradient(135deg, #0c0c1e 0%, #1a1a3e 50%, #2d1b69 100%)",
	},
	{
		label: "Sunset",
		value: "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)",
	},
	{
		label: "Aurora",
		value: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
	},
	{
		label: "Candy",
		value: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
	},
	{
		label: "Citrus",
		value: "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)",
	},
	{
		label: "Forest",
		value: "linear-gradient(135deg, #134e5e 0%, #71b280 100%)",
	},
	{
		label: "Fire",
		value: "linear-gradient(135deg, #f12711 0%, #f5af19 100%)",
	},
	{
		label: "Deep Space",
		value: "linear-gradient(135deg, #000428 0%, #004e92 100%)",
	},
	{
		label: "Slate",
		value: "linear-gradient(135deg, #2c3e50 0%, #3498db 100%)",
	},
	{
		label: "Peach",
		value: "linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)",
	},
	{ label: "Dracula", value: "#282a36" },
	{ label: "Dark", value: "#1a1a2e" },
	{ label: "Black", value: "#0a0a0a" },
];

export const fontOptions: FontOption[] = [
	{
		googleFamilyParam: "JetBrains+Mono:wght@400;500",
		label: "JetBrains Mono",
		value: "JetBrains Mono",
	},
	{
		googleFamilyParam: "Fira+Code:wght@400;500",
		label: "Fira Code",
		value: "Fira Code",
	},
	{
		googleFamilyParam: "Source+Code+Pro:wght@400;500",
		label: "Source Code Pro",
		value: "Source Code Pro",
	},
	{
		googleFamilyParam: "IBM+Plex+Mono:wght@400;500",
		label: "IBM Plex Mono",
		value: "IBM Plex Mono",
	},
	{ label: "System Mono", value: "monospace" },
];

export const paddingPresets: Record<SnapshotPadding, string> = {
	lg: "3.5rem",
	md: "2.5rem",
	sm: "1.5rem",
	xl: "5rem",
};

export const defaultCodeWindowBackground = "#282a36";

export const paddingLabels: Record<SnapshotPadding, string> = {
	lg: "L",
	md: "M",
	sm: "S",
	xl: "XL",
};

export const paddingValues: SnapshotPadding[] = ["sm", "md", "lg", "xl"];

export const themeLabels = themeList.map((theme) => theme.label);

export const fontLabels = fontOptions.map((font) => font.label);

export const defaultSnapshotOptions: SnapshotOptions = {
	background: backgroundPresets[0].value,
	fontFamily: fontOptions[0].value,
	padding: "md",
	showWindowChrome: true,
	theme: ThemeNames.Dracula,
};
