/* Constants */
import { TagSuggestionLimit } from "@/lib/constants/core";

const filterTagSuggestions = (
	availableTags: TagItem[],
	query: string,
	excludedTags: string[]
): string[] => {
	const normalizedQuery = query.trim().toLowerCase();

	if (normalizedQuery.length === 0) {
		return [];
	}

	const excluded = new Set(
		excludedTags.map((excludedTag) => excludedTag.trim().toLowerCase())
	);

	return availableTags
		.filter((tag) => {
			const normalizedName = tag.name.toLowerCase();

			return (
				normalizedName.startsWith(normalizedQuery) &&
				!excluded.has(normalizedName)
			);
		})
		.map((tag) => tag.name)
		.slice(0, TagSuggestionLimit);
};

export default filterTagSuggestions;
