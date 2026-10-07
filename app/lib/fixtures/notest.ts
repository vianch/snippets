import { NotesColors } from "../constants/notes";

export const notesFakeData: NoteData[] = [
	{
		$id: "123e4567-e89b-12d3-a456-426614174001" as UUID,
		user_id: "123e4567-e89b-12d3-a456-526614174001" as UUID,
		body: JSON.stringify(
			'Resources:\n- Book: "!You Don\'t Know JS: Scope & Closures" by Kyle Simpson.\n\n- Online Course: "JavaScript Patterns" on Udemy.\n\n- Articles:\n"Understanding JavaScript Closures" on Medium.\n\n"Mastering JavaScript Modules" on Dev.to.'
		),
		created_at: "Mon Sep 21 2026 11:41:54 GMT+0100 (British Summer Time)",
		updated_at: "Mon Sep 21 2026 11:41:54 GMT+0100 (British Summer Time)",
		color: NotesColors.Yellow.name,
		position: { x: 505, y: 10 },
		size: { height: 160, width: 400 },
	},
	{
		$id: "123e4567-e89b-12d3-a456-426614174002" as UUID,
		user_id: "123e4567-e89b-12d3-a456-526614174001" as UUID,
		body: JSON.stringify(
			'Resources:\n- Book: "2 sYou Don\'t Know JS: Scope & Closures" by Kyle Simpson.\n\n- Online Course: "JavaScript Patterns" on Udemy.\n\n- Articles:\n"Understanding JavaScript Closures" on Medium.\n\n"Mastering JavaScript Modules" on Dev.to.'
		),
		created_at: "Mon Sep 21 2026 11:41:54 GMT+0100 (British Summer Time)",
		updated_at: "Mon Sep 21 2026 11:41:54 GMT+0100 (British Summer Time)",
		color: NotesColors.Blue.name,
		position: { x: 305, y: 110 },
		size: { height: 160, width: 400 },
	},
	{
		$id: "123e4567-e89b-12d3-a456-426614174003" as UUID,
		user_id: "123e4567-e89b-12d3-a456-526614174001" as UUID,
		body: JSON.stringify(
			'Resources:\n- Book: "#You Don\'t Know JS: Scope & Closures" by Kyle Simpson.\n\n- Online Course: "JavaScript Patterns" on Udemy.\n\n- Articles:\n"Understanding JavaScript Closures" on Medium.\n\n"Mastering JavaScript Modules" on Dev.to.'
		),
		created_at: "Mon Sep 21 2026 11:41:54 GMT+0100 (British Summer Time)",
		updated_at: "Mon Sep 21 2026 11:41:54 GMT+0100 (British Summer Time)",
		color: NotesColors.Purple.name,
		position: { x: 605, y: 500 },
		size: { height: 160, width: 400 },
	},
];
