import SupportedLanguages from "@/lib/config/languages";
import uuidv4 from "../../utils/string.utilts";

export default class SnippetValueObject implements Snippet {
	public snippet_id: UUID;

	public user_id: UUID;

	public created_at: string;

	public updated_at: string;

	public name: string = "";

	public url: string | null;

	public notes: string | null;

	public snippet: string;

	public state: SnippetState;

	public tags: Tags;

	public is_public: boolean;

	public public_slug: string | null;

	language: SupportedLanguages;

	constructor(user_id: UUID) {
		this.snippet_id = uuidv4();
		this.user_id = user_id;
		this.created_at = new Date().toISOString();
		this.updated_at = new Date().toISOString();
		this.name = "";
		this.url = null;
		this.notes = null;
		this.snippet = "";
		this.language = SupportedLanguages.Markdown;
		this.state = "active";
		this.tags = null;
		this.is_public = false;
		this.public_slug = null;
	}
}
