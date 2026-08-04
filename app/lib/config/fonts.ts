export const FontNames = {
	Aleo: "aleo",
	GoogleSansCode: "google-sans-code",
	GoogleSansFlex: "google-sans-flex",
	Inconsolata: "inconsolata",
	Montserrat: "montserrat",
	OpenSans: "open-sans",
	Raleway: "raleway",
	SourceCodePro: "source-code-pro",
	SourceSans3: "source-sans-3",
} as const;

export const fontList: FontConfig[] = [
	{
		cssVariable: "--font-google-sans-flex",
		label: "Google Sans Flex",
		name: FontNames.GoogleSansFlex,
	},
	{
		cssVariable: "--font-google-sans-code",
		label: "Google Sans Code",
		name: FontNames.GoogleSansCode,
	},
	{
		cssVariable: "--font-source-code-pro",
		label: "Source Code Pro",
		name: FontNames.SourceCodePro,
	},
	{
		cssVariable: "--font-montserrat",
		label: "Montserrat",
		name: FontNames.Montserrat,
	},
	{
		cssVariable: "--font-aleo",
		label: "Aleo",
		name: FontNames.Aleo,
	},
	{
		cssVariable: "--font-open-sans",
		label: "Open Sans",
		name: FontNames.OpenSans,
	},
	{
		cssVariable: "--font-source-sans-3",
		label: "Source Sans 3",
		name: FontNames.SourceSans3,
	},
	{
		cssVariable: "--font-raleway",
		label: "Raleway",
		name: FontNames.Raleway,
	},
	{
		cssVariable: "--font-inconsolata",
		label: "Inconsolata",
		name: FontNames.Inconsolata,
	},
];

export const DefaultFontName: FontName = FontNames.GoogleSansFlex;

export const isValidFont = (font: string): font is FontName =>
	fontList.some((fontConfig) => fontConfig.name === font);
