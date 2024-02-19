import SupportedLanguages from "@/lib/config/languages";

const snippetListFixture: Snippet[] = [
	{
		snippet_id: "123e4567-e89b-12d3-a456-426614174000" as UUID,
		user_id: "123e4567-e89b-12d3-a456-426614174000" as UUID,
		created_at: "2023-04-06T14:48:00.000Z",
		updated_at: "2023-04-07T09:20:00.000Z",
		name: "Sample Snippet number 2",
		url: "https://www.example.com/snippet/1",
		notes: "This is a sample code snippet.",
		language: SupportedLanguages.JavaScript,
		snippet: "console.log('Hello, World!');",
		state: "active" as SnippetState,
		tags: [],
	},
];

export default snippetListFixture;
