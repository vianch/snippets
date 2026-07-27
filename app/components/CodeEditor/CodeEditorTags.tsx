import {
	ReactElement,
	useCallback,
	useEffect,
	useMemo,
	useState,
	ChangeEvent,
} from "react";

/* Constants */
import { MenuItems } from "@/lib/constants/core";

/* Components */
import Input from "@/components/ui/Input/Input";
import Tag from "@/components/ui/icons/Tag";
import Badge from "@/components/ui/Badge/Badge";
import CodeEditorActions from "@/components/CodeEditor/CodeEditorActions";
import TagSuggestions from "@/components/CodeEditor/TagSuggestions";

/* Utils */
import filterTagSuggestions from "@/utils/tag.utils";

/* Styles */
import styles from "./codeEditor.module.css";

type CodeEditorTagsProps = {
	activeTag: MenuItems | string;
	currentSnippet: CurrentSnippet;
	allSnippets?: Snippet[];
	availableTags?: TagItem[];
	isPublic: boolean;
	showDetails: boolean;
	hideAiButton?: boolean;
	onNewTag: (tag: string) => void;
	onChange: (e: ChangeEvent<HTMLInputElement>) => void;
	onRemoveTag: (tag: string) => void;
	onToggleDetails: () => void;
	onTogglePublic: () => void;
	onToggleHistory: () => void;
	showHistory: boolean;
	hasVersions: boolean;
	onApplyAiCode?: (code: string) => void;
	onCopyToSnippet?: (content: string) => void;
	onReplaceSnippet?: (content: string) => void;
};

const CodeEditorTags = ({
	activeTag,
	currentSnippet,
	allSnippets,
	availableTags,
	isPublic,
	showDetails,
	hideAiButton,
	onNewTag,
	onChange,
	onRemoveTag,
	onToggleDetails,
	onTogglePublic,
	onToggleHistory,
	showHistory,
	hasVersions,
	onApplyAiCode,
	onCopyToSnippet,
	onReplaceSnippet,
}: CodeEditorTagsProps): ReactElement => {
	const [tagList, setTagList] = useState<string[]>([]);
	const [tagQuery, setTagQuery] = useState<string>("");
	const suggestions = useMemo(
		() => filterTagSuggestions(availableTags ?? [], tagQuery, tagList),
		[availableTags, tagQuery, tagList]
	);
	const getTagForSnippet = (snippetTag: Tags): string[] =>
		snippetTag && snippetTag?.length > 0 ? snippetTag.trim().split(",") : [];

	const isMenuItem = (
		currentActiveTag: string
	): currentActiveTag is MenuItems => {
		return Object.values(MenuItems).includes(currentActiveTag as MenuItems);
	};

	const commitTag = useCallback(
		(tag: string): void => {
			setTagQuery("");
			onNewTag(tag);
		},
		[onNewTag]
	);

	const dismissSuggestions = useCallback((): void => setTagQuery(""), []);

	useEffect(() => {
		if (!currentSnippet?.tags && activeTag && !isMenuItem(activeTag)) {
			setTagList([activeTag]);
			onNewTag(activeTag);
		} else {
			setTagList(getTagForSnippet(currentSnippet?.tags ?? null));
		}
	}, [currentSnippet?.tags, activeTag]);

	return (
		<section className={styles.tagsContainer}>
			<div className={styles.tagsLeft}>
				<span className={styles.tagIcon} aria-hidden="true">
					<Tag width={20} height={20} />
				</span>
				{tagList?.length > 0 &&
					tagList.map((tag: string, index: number): ReactElement => (
						<Badge
							key={`${index + 1}-code-editor-tag`}
							onRemove={() => onRemoveTag(tag)}
						>
							{tag ?? ""}
						</Badge>
					))}

				{tagList?.length < 3 && (
					<div className={styles.tagInput}>
						<Input
							ghost
							disableMargin
							className={styles.tagInputField}
							cleanOnBlur
							type="text"
							placeholder={
								tagList?.length > 0 ? "Add another tag…" : "Add a tag…"
							}
							value={tagQuery}
							required={true}
							onKeyDown={commitTag}
							onChange={(event: ChangeEvent<HTMLInputElement>) => {
								setTagQuery(event.target.value);
								onChange(event);
							}}
							onBlur={commitTag}
							maxLength={25}
						/>

						<TagSuggestions
							suggestions={suggestions}
							onSelect={commitTag}
							onDismiss={dismissSuggestions}
						/>
					</div>
				)}
			</div>
			<div className={styles.tagsRight}>
				<CodeEditorActions
					currentSnippet={currentSnippet}
					allSnippets={allSnippets}
					isPublic={isPublic}
					showDetails={showDetails}
					hideAiButton={hideAiButton}
					onToggleDetails={onToggleDetails}
					onTogglePublic={onTogglePublic}
					onToggleHistory={onToggleHistory}
					showHistory={showHistory}
					hasVersions={hasVersions}
					onApplyAiCode={onApplyAiCode}
					onCopyToSnippet={onCopyToSnippet}
					onReplaceSnippet={onReplaceSnippet}
				/>
			</div>
		</section>
	);
};

export default CodeEditorTags;
