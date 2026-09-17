import { NotesColors } from "../constants/notes";

export const notesFakeData: NoteData[] = [
	{
		$id: 1,
		body: JSON.stringify(
			'Resources:\n- Book: "!You Don\'t Know JS: Scope & Closures" by Kyle Simpson.\n\n- Online Course: "JavaScript Patterns" on Udemy.\n\n- Articles:\n"Understanding JavaScript Closures" on Medium.\n\n"Mastering JavaScript Modules" on Dev.to.'
		),
		color: NotesColors.Yellow.name,
		position: JSON.stringify({ x: 505, y: 10 }),
	},
	{
		$id: 2,
		body: JSON.stringify(
			'Resources:\n- Book: "2 sYou Don\'t Know JS: Scope & Closures" by Kyle Simpson.\n\n- Online Course: "JavaScript Patterns" on Udemy.\n\n- Articles:\n"Understanding JavaScript Closures" on Medium.\n\n"Mastering JavaScript Modules" on Dev.to.'
		),
		color: NotesColors.Blue.name,
		position: JSON.stringify({ x: 305, y: 110 }),
	},
	{
		$id: 3,
		body: JSON.stringify(
			'Resources:\n- Book: "#You Don\'t Know JS: Scope & Closures" by Kyle Simpson.\n\n- Online Course: "JavaScript Patterns" on Udemy.\n\n- Articles:\n"Understanding JavaScript Closures" on Medium.\n\n"Mastering JavaScript Modules" on Dev.to.'
		),
		color: NotesColors.Purple.name,
		position: JSON.stringify({ x: 605, y: 500 }),
	},
];
