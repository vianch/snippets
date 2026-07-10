type ShortcutGroup = {
	heading: string;
	items: { keys: string[]; description: string }[];
};

const shortcutGroups: ShortcutGroup[] = [
	{
		heading: "Navigation",
		items: [
			{ keys: ["Mod", "K"], description: "Open command palette" },
			{ keys: ["Mod", "/"], description: "Open shortcuts modal" },
			{ keys: ["Mod", ","], description: "Open settings" },
			{ keys: ["Esc"], description: "Close any open modal or drawer" },
		],
	},
	{
		heading: "Editor",
		items: [
			{ keys: ["Mod", "m"], description: "Create a new snippet" },
			{ keys: ["Mod", "s"], description: "Save current snippet" },
			{
				keys: ["Mod", "Shift", "I"],
				description: "Request AI inline completion",
			},
			{ keys: ["Tab"], description: "Accept AI completion / indent" },
			{ keys: ["Esc"], description: "Dismiss AI completion" },
			{
				keys: ["["],
				description: "Type [[ in any snippet to link to another snippet",
			},
		],
	},
	{
		heading: "Markdown editor",
		items: [
			{ keys: ["Mod", "B"], description: "Bold selected text" },
			{ keys: ["Mod", "I"], description: "Italic selected text" },
			{ keys: ["Mod", "E"], description: "Wrap selection in inline code" },
			{ keys: ["Mod", "D"], description: "Duplicate current line below" },
		],
	},
	{
		heading: "Command palette (Mod+K)",
		items: [
			{ keys: ["↑", "↓"], description: "Navigate results" },
			{ keys: ["↵"], description: "Select highlighted item" },
			{ keys: ["Esc"], description: "Close the palette" },
		],
	},
];

export const ModKey = "Mod";
export const ModKeyLabel = "⌘";

export default shortcutGroups;
