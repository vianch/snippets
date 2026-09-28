"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/* Components */
import Starfield from "@/components/landing/Starfield/Starfield";
import NoteCard from "@/components/NoteCard/NoteCard";
import NotesMenu from "@/components/NotesMenu/NotesMenu";
import Button from "@/components/ui/Button/Button";
import Loading from "@/components/ui/icons/Loading";
import Plus from "@/components/ui/icons/Plus";

/* Lib */
import { ToastType } from "@/lib/constants/toast";
import useLoggedUser from "@/lib/hooks/useLoggedUser";
import NoteValueObject from "@/lib/models/Note";
import useToastStore from "@/lib/store/toast.store";
import {
	createNote,
	deleteNote,
	getAllNotes,
	updateNote,
} from "@/lib/supabase/notesQueries";
import { getNewNotePosition, pickRandomNoteColor } from "@/utils/notes.utils";

/* Hooks */
import useNewNoteShortcut from "./hooks/useNewNoteShortcut";

/* Styles */
import styles from "./stickyNotes.module.css";

const StickyNotesPage = (): React.ReactElement => {
	const router = useRouter();
	const { hasResolvedSession, isLogged, userId } = useLoggedUser();
	const { addToast } = useToastStore();
	const [notes, setNotes] = useState<NoteData[]>([]);
	const [isCreatingNote, setIsCreatingNote] = useState<boolean>(false);
	const [lastCreatedNoteId, setLastCreatedNoteId] = useState<UUID | null>(null);
	const isCreateNoteDisabled = !userId || isCreatingNote;

	const createNoteHandler = async (): Promise<void> => {
		if (isCreateNoteDisabled) {
			return;
		}

		const newNote = new NoteValueObject(
			userId,
			pickRandomNoteColor(Math.random()),
			getNewNotePosition(notes.length)
		);

		setIsCreatingNote(true);

		try {
			await createNote(newNote);
			setNotes((currentNotes) => [...currentNotes, newNote]);
			setLastCreatedNoteId(newNote.$id);
		} catch {
			addToast({ type: ToastType.Error, message: "Could not create the note" });
		} finally {
			setIsCreatingNote(false);
		}
	};

	const newNoteShortcutLabel = useNewNoteShortcut(createNoteHandler);

	const updateNoteHandler = async (
		noteId: UUID,
		changes: NoteChanges
	): Promise<void> => {
		try {
			await updateNote(noteId, changes);
		} catch {
			addToast({ type: ToastType.Error, message: "Could not save the note" });
		}
	};

	const deleteNoteHandler = async (noteId: UUID): Promise<boolean> => {
		try {
			await deleteNote(noteId);
			setNotes((currentNotes) =>
				currentNotes.filter((note: NoteData) => note.$id !== noteId)
			);

			return true;
		} catch {
			addToast({ type: ToastType.Error, message: "Could not delete the note" });

			return false;
		}
	};

	useEffect(() => {
		getAllNotes().then((data: NoteData[]) => {
			setNotes(data);
		});
	}, []);

	useEffect(() => {
		if (hasResolvedSession && !isLogged) {
			router.replace("/login");
		}
	}, [hasResolvedSession, isLogged, router]);

	return (
		<div className={styles.page}>
			<div aria-hidden="true" className={styles.backdrop}>
				<Starfield />
			</div>

			<header className={styles.topBar}>
				<div className={styles.topBarActions}>
					<Button
						className={styles.newNoteButton}
						disabled={isCreateNoteDisabled}
						onClick={createNoteHandler}
					>
						{isCreatingNote ? (
							<Loading width={16} height={16} />
						) : (
							<Plus width={16} height={16} />
						)}
						New note
						<kbd className={styles.shortcutHint}>{newNoteShortcutLabel}</kbd>
					</Button>

					<NotesMenu />
				</div>
			</header>

			<section className={styles.board}>
				{notes.map((note: NoteData) => (
					<NoteCard
						key={note.$id}
						autoFocus={note.$id === lastCreatedNoteId}
						note={note}
						onDelete={deleteNoteHandler}
						onUpdate={updateNoteHandler}
					/>
				))}
			</section>
		</div>
	);
};

export default StickyNotesPage;
