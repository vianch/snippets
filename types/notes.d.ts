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

type NoteSize = {
	height: number;
	width: number;
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
	size: NoteSize;
};

type NoteRecord = Omit<NoteData, "size"> & {
	size: NoteSize | null;
};

type NoteChanges = Partial<Pick<NoteData, "body" | "position" | "size">>;
