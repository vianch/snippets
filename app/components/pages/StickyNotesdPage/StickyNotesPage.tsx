"use client";

import NoteCard from "@/components/NoteCard/NoteCard";
import { notesFakeData } from "@/lib/fixtures/notest";

const StickyNotesPage = (): React.ReactElement => {
	return (
		<section>
			{notesFakeData.map((note: NoteData, index: number) => (
				<NoteCard key={`${index + 1}-note-${note.$id}`} note={note} />
			))}
		</section>
	);
};

export default StickyNotesPage;
