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

type NoteData = {
	$id: number;
	body: string;
	color: string;
	position: string;
};
