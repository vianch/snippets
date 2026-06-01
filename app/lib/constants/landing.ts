import { languageAbbreviations } from "@/lib/config/languages";
import { themeList } from "@/lib/config/themes";

/* Icons */
import Book from "@/components/ui/icons/Book";
import Camera from "@/components/ui/icons/Camera";
import Clock from "@/components/ui/icons/Clock";
import Code from "@/components/ui/icons/Code";
import Globe from "@/components/ui/icons/Globe";
import Link from "@/components/ui/icons/Link";
import Lock from "@/components/ui/icons/Lock";
import MagnifyingGlass from "@/components/ui/icons/MagnifyingGlass";
import Sparkle from "@/components/ui/icons/Sparkle";
import Tag from "@/components/ui/icons/Tag";

/* Derived counts — single source of truth */
export const LanguageCount = Object.keys(languageAbbreviations).length;
export const ThemeCount = themeList.length;
export const aiProviderNames = [
	"Ollama",
	"Claude",
	"OpenAI",
	"NVIDIA",
] as const;
export const AiProviderCount = aiProviderNames.length;
export const VersionHistoryLimit = 5;

/* Hero */
export const HeroEyebrow = "Your personal code library";
export const HeroHeadline = "Code snippets that finish themselves";
export const HeroSubhead = `Save, organize, and share your code in ${LanguageCount} languages — with an AI pair that completes your next line, explains anything, and reshapes code on command.`;
export const HeroPrimaryCta = "Start saving snippets";
export const HeroSecondaryCta = "Explore features";

/* Hero editor mock */
export const HeroFileName = "utils/groupBy.ts";
export const heroCodeLines: LandingCodeToken[][] = [
	[{ kind: "comment", text: "// group a list by any key" }],
	[
		{ kind: "keyword", text: "const " },
		{ kind: "function", text: "groupBy" },
		{ kind: "plain", text: " = (items, key) => {" },
	],
	[
		{ kind: "plain", text: "  " },
		{ kind: "keyword", text: "return " },
		{ kind: "plain", text: "items." },
		{ kind: "function", text: "reduce" },
		{ kind: "plain", text: "((groups, item) => {" },
	],
	[
		{ kind: "plain", text: "    " },
		{ kind: "keyword", text: "const " },
		{ kind: "plain", text: "value = item[key];" },
	],
];
export const heroGhostLine = "    (groups[value] ??= []).push(item);";
export const heroGhostHint = "Tab";

/* Stats */
export const statItems: LandingStat[] = [
	{ label: "Languages", suffix: "", value: LanguageCount },
	{ label: "Editor themes", suffix: "", value: ThemeCount },
	{ label: "AI providers", suffix: "", value: AiProviderCount },
	{ label: "Versions kept", suffix: "", value: VersionHistoryLimit },
];

/* Features */
export const FeaturesHeading = "Everything you need, nothing you don't";
export const FeaturesSubheading =
	"From a snappy editor to an AI that pairs with you — Snippets covers the whole loop.";

export const landingFeatures: LandingFeature[] = [
	{
		accent: "purple",
		description:
			"Inline completion finishes your line as you type, and a chat panel explains, refactors, and comments on demand.",
		detail: "Ollama · Claude · OpenAI · NVIDIA",
		icon: Sparkle,
		image: "/assets/images/jpg/code-that-finishes-itself.jpg",
		size: "large",
		title: "Code that finishes itself",
	},
	{
		accent: "cyan",
		description:
			"Syntax highlighting, smart indentation, and a buttery CodeMirror core tuned for fast, focused writing.",
		detail: `${LanguageCount} languages · ${ThemeCount} themes`,
		icon: Code,
		image: "/assets/images/jpg/an-editor-made-for-code.jpg",
		size: "large",
		title: "An editor made for code",
	},
	{
		accent: "green",
		description:
			"Every save quietly snapshots your snippet, so you can roll back to a good version whenever you need it.",
		detail: `Last ${VersionHistoryLimit} versions kept`,
		icon: Clock,
		image: "/assets/images/jpg/nerve-lose-a-good-version.jpg",
		size: "medium",
		title: "Never lose a good version",
	},
	{
		accent: "blue",
		description:
			"Full-text search across names, code, and tags, plus a command palette to jump anywhere in a keystroke.",
		detail: "⌘K command palette",
		icon: MagnifyingGlass,
		image: "/assets/images/jpg/find-anything-instantly.jpg",
		size: "medium",
		title: "Find anything instantly",
	},
	{
		accent: "cyan",
		description:
			"Turn any snippet into a polished image to drop into a pull request, a doc, or a post.",
		detail: "PNG screenshots",
		icon: Camera,
		image: "/assets/images/jpg/export-as-an-image.jpg",
		size: "medium",
		title: "Export as an image",
	},
	{
		accent: "yellow",
		description:
			"Flip a snippet public and hand over a clean, read-only page — no account required to view it.",
		detail: "/s/ public pages",
		icon: Globe,
		image: "/assets/images/jpg/share-with-one-link.jpg",
		size: "medium",
		title: "Share with one link",
	},
	{
		accent: "purple",
		description:
			"Type [[ to connect related snippets into a personal, navigable knowledge base.",
		detail: "[[ linked notes ]]",
		icon: Link,
		size: "small",
		title: "Wiki-link your snippets",
	},
	{
		accent: "orange",
		description:
			"Tags, favorites, folders, smart groups, and a trash you can undo — bend your library to your own brain.",
		detail: "Tag · Favorite · Folder",
		icon: Tag,
		size: "small",
		title: "Organize it your way",
	},
	{
		accent: "green",
		description:
			"Write Markdown and watch the formatted preview update live, side by side with your source.",
		detail: "Live HTML preview",
		icon: Book,
		size: "small",
		title: "Markdown, live",
	},
	{
		accent: "red",
		description:
			"Protect your account with TOTP two-factor authentication and one-time recovery codes.",
		detail: "2FA + recovery codes",
		icon: Lock,
		size: "small",
		title: "Locked down",
	},
];

/* Languages marquee */
export const LanguagesLabel = `${LanguageCount} languages, syntax-highlighted out of the box`;
export const languageDisplayNames = [
	"JavaScript",
	"TypeScript",
	"Python",
	"Rust",
	"Go",
	"Java",
	"C",
	"C++",
	"Ruby",
	"PHP",
	"Swift",
	"Kotlin",
	"Dart",
	"SQL",
	"HTML",
	"CSS",
	"JSON",
	"YAML",
	"Bash",
	"Markdown",
];

/* Themes section */
export const ThemesHeading = "Six themes. Pick your mood.";
export const ThemesSubheading =
	"Light or dark, every theme is hand-tuned down to the syntax colors. Try one on the editor above.";

/* Shortcuts section */
export const ShortcutsHeading = "Built for the keyboard";
export const ShortcutsSubheading =
	"Stay in flow — your hands never have to leave the home row.";
