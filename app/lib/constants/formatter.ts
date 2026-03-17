import type { Plugin } from "prettier";

import SupportedLanguages from "@/lib/config/languages";

type ParserConfig = {
	parser: string;
	plugins: (() => Promise<Plugin>)[];
};

const parserMap: Partial<Record<SupportedLanguages, ParserConfig>> = {
	[SupportedLanguages.JavaScript]: {
		parser: "babel",
		plugins: [
			() => import("prettier/plugins/babel") as Promise<Plugin>,
			() => import("prettier/plugins/estree") as Promise<Plugin>,
		],
	},
	[SupportedLanguages.TypeScript]: {
		parser: "typescript",
		plugins: [
			() => import("prettier/plugins/typescript") as Promise<Plugin>,
			() => import("prettier/plugins/estree") as Promise<Plugin>,
		],
	},
	[SupportedLanguages.CSS]: {
		parser: "css",
		plugins: [() => import("prettier/plugins/postcss") as Promise<Plugin>],
	},
	[SupportedLanguages.HTML]: {
		parser: "html",
		plugins: [() => import("prettier/plugins/html") as Promise<Plugin>],
	},
	[SupportedLanguages.JSON]: {
		parser: "json",
		plugins: [
			() => import("prettier/plugins/babel") as Promise<Plugin>,
			() => import("prettier/plugins/estree") as Promise<Plugin>,
		],
	},
	[SupportedLanguages.Markdown]: {
		parser: "markdown",
		plugins: [() => import("prettier/plugins/markdown") as Promise<Plugin>],
	},
};

export default parserMap;
