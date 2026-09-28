type NoteColor = {
	id: string;
	name: string;
	colorHeader: string;
	colorBody: string;
	colorText: string;
};

type NotePosition = {
	x: number;
	y: number;
};

type NoteColorName = "yellow" | "green" | "blue" | "purple";

type NoteData = {
	$id: UUID;
	user_id: UUID;
	created_at: string;
	updated_at: string;
	body: string;
	color: NoteColorName;
	position: NotePosition;
};

type NoteChanges = Partial<Pick<NoteData, "body" | "position">>;
