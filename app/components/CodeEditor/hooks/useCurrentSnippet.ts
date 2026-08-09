"use client";

import { useState, useRef, useEffect, useMemo, ChangeEvent } from "react";

/* Lib */
import SupportedLanguages from "@/lib/config/languages";
import languageExtensions from "@/lib/codeEditor";
import useUserStore from "@/lib/store/user.store";
import useToastStore from "@/lib/store/toast.store";
import {
	MaxSnippetTags,
	MenuItems,
	MenuPrefixes,
	SnippetState,
} from "@/lib/constants/core";
import { ToastType } from "@/lib/constants/toast";
import {
	getSnippetVersion,
	getSnippetVersions,
	toggleSnippetPublic,
} from "@/lib/storage/snippets";

type UseCurrentSnippetProps = {
	snippet: Snippet | null;
	defaultLanguage: SupportedLanguages;
	codeEditorStates: SnippetEditorStates;
	onSave: (
		currentSnippet: CurrentSnippet,
		fromButton: boolean | SnippetState.Favorite
	) => void;
	onStarred: (currentSnippet: CurrentSnippet) => void;
	onPublicToggle: (currentSnippet: CurrentSnippet) => void;
	onTouched: (touched: boolean) => void;
};

type UseCurrentSnippetReturn = {
	currentSnippet: CurrentSnippet;
	setCurrentSnippet: (snippet: CurrentSnippet) => void;
	tagList: string[];
	showDetails: boolean;
	setShowDetails: (show: boolean) => void;
	showHistory: boolean;
	setShowHistory: (show: boolean) => void;
	versionCount: number;
	preRestoreSnapshot: CurrentSnippet | null;
	setPreRestoreSnapshot: (snapshot: CurrentSnippet | null) => void;
	updateCurrentSnippetValue: (value: string) => void;
	updateCurrentSnippetName: (event: ChangeEvent<HTMLInputElement>) => void;
	updateCurrentSnippetUrl: (event: ChangeEvent<HTMLInputElement>) => void;
	updateCurrentSnippetNotes: (event: ChangeEvent<HTMLTextAreaElement>) => void;
	updateCurrentSnippetFolder: (folder: string) => void;
	setLanguageHandler: (selectedLanguage: string) => void;
	starringHandler: () => void;
	newTagHandler: (newTagValue: string) => void;
	removeTagHandler: (tagRemoved: string) => void;
	togglePublicHandler: () => Promise<void>;
	refreshVersionCount: (snippetId: UUID) => void;
	restoreVersionHandler: (version: SnippetVersionSummary) => Promise<void>;
	saveHandler: () => void;
};

const useCurrentSnippet = ({
	snippet,
	defaultLanguage,
	codeEditorStates,
	onSave,
	onStarred,
	onPublicToggle,
	onTouched,
}: UseCurrentSnippetProps): UseCurrentSnippetReturn => {
	const autoSave = useUserStore((state) => state.autoSave);
	const { addToast } = useToastStore();
	const { menuType, touched } = codeEditorStates ?? {};
	const isTrashActive = menuType === "trash";

	const [currentSnippet, setCurrentSnippet] = useState<CurrentSnippet>({
		...({} as Snippet),
		snippet: "",
		tags: null,
		language: defaultLanguage,
		extension: languageExtensions[defaultLanguage],
	});
	const [showDetails, setShowDetails] = useState(false);
	const [showHistory, setShowHistory] = useState(false);
	const [versionCount, setVersionCount] = useState(0);
	const [preRestoreSnapshot, setPreRestoreSnapshot] =
		useState<CurrentSnippet | null>(null);
	const previousSnippetIdRef = useRef<UUID | null>(null);
	const tagList = useMemo(
		() =>
			currentSnippet.tags && currentSnippet.tags.length > 0
				? currentSnippet.tags.trim().split(",")
				: [],
		[currentSnippet.tags]
	);
	// Tag routes look like `tag:react`; anything else is not a tag context.
	const activeTag = menuType?.startsWith(MenuPrefixes.Tag)
		? menuType.slice(MenuPrefixes.Tag.length)
		: "";

	const isMenuItem = (
		currentActiveTag: string
	): currentActiveTag is MenuItems =>
		Object.values(MenuItems).includes(currentActiveTag as MenuItems);

	const setLanguageExtension = (newLanguage: SupportedLanguages): void => {
		setCurrentSnippet({
			...currentSnippet,
			language: newLanguage,
			extension: languageExtensions[newLanguage],
		});

		onTouched(true);
	};

	const setLanguageHandler = (selectedLanguage: string): void => {
		const languageSelected = selectedLanguage ?? defaultLanguage;

		setLanguageExtension(languageSelected as SupportedLanguages);
	};

	const updateCurrentSnippetValue = (value: string): void => {
		setCurrentSnippet({
			...currentSnippet,
			snippet: value ?? "",
		});

		onTouched(true);
	};

	const updateCurrentSnippetName = (
		event: ChangeEvent<HTMLInputElement>
	): void => {
		event?.preventDefault();

		const name = event?.target?.value ?? "";

		setCurrentSnippet({ ...currentSnippet, name });

		onTouched(name?.length > 0);
	};

	const updateCurrentSnippetUrl = (
		event: ChangeEvent<HTMLInputElement>
	): void => {
		setCurrentSnippet({ ...currentSnippet, url: event.target.value });
		onTouched(true);
	};

	const updateCurrentSnippetNotes = (
		event: ChangeEvent<HTMLTextAreaElement>
	): void => {
		setCurrentSnippet({ ...currentSnippet, notes: event.target.value });
		onTouched(true);
	};

	// Takes the raw value rather than a change event so the folder autocomplete
	// can commit a picked suggestion through the same dirty-flag path.
	const updateCurrentSnippetFolder = (folder: string): void => {
		setCurrentSnippet({
			...currentSnippet,
			folder: folder.trim().length > 0 ? folder : null,
		});
		onTouched(true);
	};

	const starringHandler = (): void => {
		const newCurrentSnippet = {
			...currentSnippet,
			state:
				currentSnippet?.state === SnippetState.Favorite
					? SnippetState.Active
					: SnippetState.Favorite,
		} as CurrentSnippet;
		const isFavoriteMenu = codeEditorStates?.menuType === "favorites";
		const fromButton = isFavoriteMenu ? SnippetState.Favorite : true;

		setCurrentSnippet(newCurrentSnippet);
		onSave(newCurrentSnippet, fromButton);

		if (isFavoriteMenu) {
			onStarred(newCurrentSnippet);
		}
	};

	const newTagHandler = (newTagValue: string): void => {
		const currentTags = currentSnippet?.tags
			? currentSnippet.tags?.split(",")
			: [];
		const newTagValueTrimmed = newTagValue.trim();

		if (
			!newTagValue ||
			newTagValue.length >= 28 ||
			currentTags.length >= MaxSnippetTags ||
			currentTags.includes(newTagValueTrimmed)
		)
			return;

		const updatedTags = currentSnippet?.tags
			? `${currentSnippet.tags},${newTagValueTrimmed}`
			: newTagValueTrimmed;

		setCurrentSnippet({ ...currentSnippet, tags: updatedTags });
		onTouched(true);
	};

	const removeTagHandler = (tagRemoved: string): void => {
		if (!tagRemoved) return;

		const updatedTags = currentSnippet?.tags
			? currentSnippet.tags
					.split(",")
					.filter((tag: string) => tag !== tagRemoved)
					.join(",")
			: null;

		setCurrentSnippet({ ...currentSnippet, tags: updatedTags });
		onTouched(true);
	};

	const togglePublicHandler = async (): Promise<void> => {
		const newIsPublic = !currentSnippet.is_public;
		const slug = await toggleSnippetPublic(
			currentSnippet.snippet_id,
			newIsPublic,
			currentSnippet.public_slug
		);

		const updatedSnippet = {
			...currentSnippet,
			is_public: newIsPublic,
			public_slug: slug,
		};

		setCurrentSnippet(updatedSnippet);
		onPublicToggle(updatedSnippet);
		onTouched(false);

		if (newIsPublic && slug) {
			const shareUrl = `${window.location.origin}/s/${slug}`;

			await navigator.clipboard.writeText(shareUrl).catch(() => null);
			addToast({
				type: ToastType.Success,
				message: "Snippet is now public! Link copied.",
			});
		} else {
			addToast({
				type: ToastType.Info,
				message: "Snippet is now private",
			});
		}
	};

	const refreshVersionCount = (snippetId: UUID): void => {
		getSnippetVersions(snippetId)
			.then((versions) => setVersionCount(versions.length))
			.catch(() => setVersionCount(0));
	};

	// The history list carries metadata only, so the body of the version the user
	// picked is fetched here instead of shipping five snippet bodies with the list.
	const restoreVersionHandler = async (
		version: SnippetVersionSummary
	): Promise<void> => {
		const fullVersion = await getSnippetVersion(version.version_id);

		if (!fullVersion) {
			addToast({
				type: ToastType.Error,
				message: "Could not load that version",
			});

			return;
		}

		// `language` is a free-text column; the editor only knows SupportedLanguages.
		const restoredLanguage = fullVersion.language as SupportedLanguages;

		if (!preRestoreSnapshot) {
			setPreRestoreSnapshot({ ...currentSnippet });
		}

		setCurrentSnippet({
			...currentSnippet,
			snippet: fullVersion.content,
			language: restoredLanguage,
			name: fullVersion.name,
			tags: fullVersion.tags,
			extension: languageExtensions[restoredLanguage],
		});
		onTouched(true);
		setShowDetails(false);
		refreshVersionCount(currentSnippet.snippet_id);
	};

	const saveHandler = (): void => {
		onSave(currentSnippet, true);
	};

	// Load new snippet when switching
	useEffect(() => {
		if (!snippet) return;

		if (previousSnippetIdRef.current === snippet.snippet_id) {
			return;
		}

		const isSnippetSwitch = previousSnippetIdRef.current !== null;

		if (isSnippetSwitch && autoSave && touched && !isTrashActive) {
			onSave(currentSnippet, false);
		}

		previousSnippetIdRef.current = snippet.snippet_id;

		setCurrentSnippet({
			...currentSnippet,
			...snippet,
			extension: languageExtensions[snippet.language ?? defaultLanguage],
		});

		onTouched(false);
		setPreRestoreSnapshot(null);
	}, [snippet?.snippet_id, autoSave, touched, isTrashActive]);

	// Snippets created from an Aside tag route inherit that tag. The snippet_id
	// guard is load-bearing: currentSnippet starts as an empty placeholder with
	// `tags: null`, and applying the tag to it would be clobbered a moment later
	// when the load effect spreads Supabase's own `tags: null` over the state.
	useEffect(() => {
		if (!currentSnippet.snippet_id || currentSnippet.tags) {
			return;
		}

		if (!activeTag || isMenuItem(activeTag)) {
			return;
		}

		newTagHandler(activeTag);
	}, [currentSnippet.snippet_id, currentSnippet.tags, activeTag]);

	// Refresh version count when snippet changes
	useEffect(() => {
		if (currentSnippet?.snippet_id) {
			refreshVersionCount(currentSnippet.snippet_id);
		}
	}, [currentSnippet?.snippet_id]);

	// Re-sync favorite/active/inactive state when toggled externally (e.g., from SnippetList)
	useEffect(() => {
		if (!snippet) {
			return;
		}

		if (snippet.snippet_id !== currentSnippet.snippet_id) {
			return;
		}

		if (snippet.state === currentSnippet.state) {
			return;
		}

		setCurrentSnippet({ ...currentSnippet, state: snippet.state });
	}, [snippet?.state]);

	return {
		currentSnippet,
		setCurrentSnippet,
		tagList,
		showDetails,
		setShowDetails,
		showHistory,
		setShowHistory,
		versionCount,
		preRestoreSnapshot,
		setPreRestoreSnapshot,
		updateCurrentSnippetValue,
		updateCurrentSnippetName,
		updateCurrentSnippetUrl,
		updateCurrentSnippetNotes,
		updateCurrentSnippetFolder,
		setLanguageHandler,
		starringHandler,
		newTagHandler,
		removeTagHandler,
		togglePublicHandler,
		refreshVersionCount,
		restoreVersionHandler,
		saveHandler,
	};
};

export default useCurrentSnippet;
