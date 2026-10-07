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

export const NotesColorNames: NoteColorName[] = Object.values(NotesColors).map(
	(noteColor) => noteColor.name
);

export const NotesRoutePath = "/notes";

export const NoteSaveDebounceMs = 800;

export const NewNoteOriginPx = 24;

export const NewNoteCascadeStepPx = 32;

export const NewNoteCascadeLength = 8;

export const NewNoteShortcutCode = "KeyM";

export const MacNewNoteShortcutLabel = "⌘ M";

export const DefaultNewNoteShortcutLabel = "Ctrl M";

export const NotesMenuCloseKey = "Escape";

export const NotesStackedLayoutQuery = "(width <= 768px)";

export const DefaultNoteSize: NoteSize = {
	height: 100,
	width: 400,
};

export const enum NoteResizeAxis {
	Both = "both",
	Horizontal = "horizontal",
	Vertical = "vertical",
}
