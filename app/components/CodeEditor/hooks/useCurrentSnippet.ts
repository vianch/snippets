"use client";

import { useState, useRef, useEffect, ChangeEvent } from "react";

/* Lib */
import SupportedLanguages from "@/lib/config/languages";
import languageExtensions from "@/lib/codeEditor";
import useUserStore from "@/lib/store/user.store";
import useToastStore from "@/lib/store/toast.store";
import { ToastType } from "@/lib/constants/toast";
import {
	toggleSnippetPublic,
	getSnippetVersions,
} from "@/lib/supabase/queries";

type UseCurrentSnippetProps = {
	snippet: Snippet | null;
	defaultLanguage: SupportedLanguages;
	codeEditorStates: SnippetEditorStates;
	onSave: (
		currentSnippet: CurrentSnippet,
		fromButton: boolean | "favorite"
	) => void;
	onStarred: (currentSnippet: CurrentSnippet) => void;
	onPublicToggle: (currentSnippet: CurrentSnippet) => void;
	onTouched: (touched: boolean) => void;
};

type UseCurrentSnippetReturn = {
	currentSnippet: CurrentSnippet;
	setCurrentSnippet: (snippet: CurrentSnippet) => void;
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
	setLanguageHandler: (selectedLanguage: string) => void;
	starringHandler: () => void;
	newTagHandler: (newTagValue: string) => void;
	removeTagHandler: (tagRemoved: string) => void;
	togglePublicHandler: () => Promise<void>;
	refreshVersionCount: (snippetId: UUID) => void;
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

	const starringHandler = (): void => {
		const newCurrentSnippet = {
			...currentSnippet,
			state: currentSnippet?.state === "favorite" ? "active" : "favorite",
		} as CurrentSnippet;
		const isFavoriteMenu = codeEditorStates?.menuType === "favorites";
		const fromButton = isFavoriteMenu ? "favorite" : true;

		setCurrentSnippet(newCurrentSnippet);
		onSave(newCurrentSnippet, fromButton);

		if (isFavoriteMenu) {
			onStarred(newCurrentSnippet);
		}
	};

	const newTagHandler = (newTagValue: string): void => {
		const tagList = currentSnippet?.tags ? currentSnippet.tags?.split(",") : [];
		const newTagValueTrimmed = newTagValue.trim();

		if (
			!newTagValue ||
			newTagValue.length >= 28 ||
			tagList.length >= 3 ||
			tagList.includes(newTagValueTrimmed)
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

	const saveHandler = (): void => {
		onSave(currentSnippet, true);
	};

	// Sync language extension when snippet language changes
	useEffect(() => {
		if (snippet?.language) {
			setLanguageExtension(snippet.language);
		}
	}, [snippet?.language]);

	// Load new snippet when switching
	useEffect(() => {
		if (!snippet) return;

		const isSnippetSwitch =
			previousSnippetIdRef.current !== null &&
			previousSnippetIdRef.current !== snippet.snippet_id;

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
	}, [snippet?.snippet_id]);

	// Refresh version count when snippet changes
	useEffect(() => {
		if (currentSnippet?.snippet_id) {
			refreshVersionCount(currentSnippet.snippet_id);
		}
	}, [currentSnippet?.snippet_id]);

	return {
		currentSnippet,
		setCurrentSnippet,
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
		setLanguageHandler,
		starringHandler,
		newTagHandler,
		removeTagHandler,
		togglePublicHandler,
		refreshVersionCount,
		saveHandler,
	};
};

export default useCurrentSnippet;
