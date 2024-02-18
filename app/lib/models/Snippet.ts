import SupportedLanguages from "@/lib/config/languages";
import uuidv4 from "../../utils/string.utilts";

function generateRandomName(): string {
	// Optional arrays for middle names and titles
	const middleNames = ["A.", "M.", "L.", "J."];
	const titles = ["Dr.", "Mr.", "Ms.", "Mrs."];
	const firstNames = [
		"Alice",
		"Bob",
		"Charlie",
		"David",
		"Emily",
		"Fiona",
		"George",
		"Henry",
		"Isabella",
		"Jack",
	];
	const lastNames = [
		"Smith",
		"Johnson",
		"Williams",
		"Brown",
		"Jones",
		"Miller",
		"Davis",
		"Garcia",
		"Rodriguez",
		"Wilson",
	];

	const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
	const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

	// Optionally add middle name and title
	const middleName =
		Math.random() > 0.5
			? ` ${middleNames[Math.floor(Math.random() * middleNames.length)]} `
			: "";
	const title =
		Math.random() > 0.8
			? `${titles[Math.floor(Math.random() * titles.length)]} `
			: "";

	return `${title} ${firstName} ${middleName}   ${lastName}`;
}

export default class SnippetValueObject implements Snippet {
	public snippet_id: UUID;

	public user_id: UUID;

	public created_at: string;

	public updated_at: string;

	public name: string;

	public url: string;

	public notes: string;

	public snippet: string;

	language: SupportedLanguages;

	constructor(user_id: UUID) {
		this.snippet_id = uuidv4();
		this.user_id = user_id;
		this.created_at = new Date().toISOString();
		this.updated_at = new Date().toISOString();
		this.name = generateRandomName();
		this.url = "";
		this.notes = "";
		this.snippet = "";
		this.language = SupportedLanguages.JavaScript;
	}
}
