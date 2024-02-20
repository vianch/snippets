import SupportedLanguages from "@/lib/config/languages";
import uuidv4 from "../../utils/string.utilts";

export default class SnippetValueObject implements Snippet {
	public snippet_id: UUID;

	public user_id: UUID;

	public created_at: string;

	public updated_at: string;

	public name: string | null = null;

	public url: string | null;

	public notes: string | null;

	public snippet: string;

	public state: SnippetState;

	language: SupportedLanguages;

	constructor(user_id: UUID) {
		this.snippet_id = uuidv4();
		this.user_id = user_id;
		this.created_at = new Date().toISOString();
		this.updated_at = new Date().toISOString();
		this.name = null;
		this.url = null;
		this.notes = null;
		this.snippet = "";
		this.language = SupportedLanguages.JavaScript;
		this.state = "active";
	}
}
