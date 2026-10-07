import supabase from "@/lib/supabase/client";
import { logger } from "@/lib/logger/logger";
import { getUserIdBySession } from "@/lib/supabase/userQueries";

import { DefaultNoteSize } from "../constants/notes";
import { NoteColumns, NoteTableName } from "../constants/storage.constants";

const failNoteQuery = (message: string, cause?: unknown): never => {
	logger.error(cause ?? message, { query: message });

	throw new Error(message);
};

export const getAllNotes = async (): Promise<NoteData[]> => {
	const userId = await getUserIdBySession();

	if (!supabase || !userId) {
		return [] as NoteData[];
	}

	const { data, error } = await supabase
		.from(NoteTableName)
		.select(NoteColumns)
		.order("updated_at", { ascending: false })
		.match({ user_id: userId })
		.overrideTypes<NoteRecord[]>();

	if (error) {
		logger.error(error, { query: "Error loading notes" });

		return [];
	}

	return (data ?? []).map((note) => ({
		...note,
		size: note.size ?? { ...DefaultNoteSize },
	}));
};

export const createNote = async (note: NoteData): Promise<void> => {
	const userId = await getUserIdBySession();

	if (!supabase || !userId) {
		return failNoteQuery("Not authenticated");
	}

	const { error } = await supabase.from(NoteTableName).insert({
		$id: note.$id,
		user_id: userId,
		created_at: note.created_at,
		updated_at: note.updated_at,
		body: note.body,
		color: note.color,
		position: note.position,
		size: note.size,
	});

	if (error) {
		failNoteQuery("Error creating note", error);
	}
};

export const updateNote = async (
	noteId: UUID,
	changes: NoteChanges
): Promise<void> => {
	const userId = await getUserIdBySession();

	if (!supabase || !userId) {
		return failNoteQuery("Not authenticated");
	}

	const { error } = await supabase
		.from(NoteTableName)
		.update({ ...changes, updated_at: new Date().toISOString() })
		.match({ $id: noteId, user_id: userId });

	if (error) {
		failNoteQuery("Error saving note", error);
	}
};

export const deleteNote = async (noteId: UUID): Promise<void> => {
	const userId = await getUserIdBySession();

	if (!supabase || !userId) {
		return failNoteQuery("Not authenticated");
	}

	const { error } = await supabase
		.from(NoteTableName)
		.delete()
		.match({ $id: noteId, user_id: userId });

	if (error) {
		failNoteQuery("Error deleting note", error);
	}
};
