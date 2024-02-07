type Tags = string[];

interface Snippet {
	id: string;
	createdAt: string;
	updatedAt: string;
	deletedAt?: string;
	name: string;
	url: string;
	notes: string;
	snippet: string;
	tags?: Tags;
}
