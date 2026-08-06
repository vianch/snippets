// Deliberately a runtime `enum`, not a `const enum`: the tag guard in
// useCurrentSnippet calls `Object.values(MenuItems)`, which needs the emitted
// runtime object. A `const enum` would erase it and silently break the guard.
export enum MenuItems {
	All = "all",
	Uncategorized = "uncategorized",
	Public = "public",
	Favorites = "favorites",
	Trash = "trash",
	None = "none",
}

export enum SnippetState {
	Active = "active",
	Inactive = "inactive",
	Favorite = "favorite",
}

export enum MenuPrefixes {
	Folder = "folder:",
	SmartGroup = "smart:",
	Tag = "tag:",
}

export enum AsideSectionKeys {
	Folders = "aside-folders-expanded",
	SmartGroups = "aside-smart-groups-expanded",
	Tags = "aside-tags-expanded",
}

export const AsideScrollThreshold = 12;

export const TagSuggestionLimit = 6;

export const MaxSnippetTags = 3;

export const tags = "tags";
