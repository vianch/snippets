export const NotesColors = {
	Yellow: {
		id: "color-yellow",
		name: "yellow",
		colorHeader: "#FFEFBE",
		colorBody: "#FFF5DF",
		colorText: "#18181A",
	},
	Green: {
		id: "color-green",
		name: "green",
		colorHeader: "#AFDA9F",
		colorBody: "#BCDEAF",
		colorText: "#18181A",
	},
	Blue: {
		id: "color-blue",
		name: "blue",
		colorHeader: "#9BD1DE",
		colorBody: "#A6DCE9",
		colorText: "#18181A",
	},
	Purple: {
		id: "color-purple",
		name: "purple",
		colorHeader: "#FED0FD",
		colorBody: "#FEE5FD",
		colorText: "#18181A",
	},
} as const;
export type NotesColors = (typeof NotesColors)[keyof typeof NotesColors];

export const NotesZIndex = {
	Default: -1,
	Selected: 999,
} as const;
