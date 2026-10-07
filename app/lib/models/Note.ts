// Utils
import uuidv4 from "../../utils/string.utils";
import { DefaultNoteSize } from "../constants/notes";

export default class NoteValueObject implements NoteData {
	public $id: UUID;
	public user_id: UUID;
	public created_at: string;
	public updated_at: string;
	public body: string;
	public color: NoteColorName;
	public position: NotePosition;
	public size: NoteSize;

	constructor(user_id: UUID, color: NoteColorName, position: NotePosition) {
		const createdAt = new Date().toISOString();

		this.$id = uuidv4();
		this.user_id = user_id;
		this.created_at = createdAt;
		this.updated_at = createdAt;
		this.body = "";
		this.color = color;
		this.position = position;
		this.size = { ...DefaultNoteSize };
	}
}
