import { ReactElement, useEffect, useState, ChangeEvent } from "react";

/* Constants */
import { MenuItems } from "@/lib/constants/core";

/* Components */
import Input from "@/components/ui/Input/Input";
import Tag from "@/components/ui/icons/Tag";
import Badge from "@/components/ui/Badge/Badge";
import CodeEditorActions from "@/components/CodeEditor/CodeEditorActions";

/* Styles */
import styles from "./codeEditor.module.css";

type CodeEditorTagsProps = {
	activeTag: MenuItems | string;
	currentSnippet: CurrentSnippet;
	allSnippets?: Snippet[];
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
	const getTagForSnippet = (snippetTag: Tags): string[] =>
		snippetTag && snippetTag?.length > 0 ? snippetTag.trim().split(",") : [];

	const isMenuItem = (
		currentActiveTag: string
	): currentActiveTag is MenuItems => {
		return Object.values(MenuItems).includes(currentActiveTag as MenuItems);
	};

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
					tagList.map(
						(tag: string, index: number): ReactElement => (
							<Badge
								key={`${index + 1}-code-editor-tag`}
								onRemove={() => onRemoveTag(tag)}
							>
								{tag ?? ""}
							</Badge>
						)
					)}

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
							value=""
							required={true}
							onKeyDown={onNewTag}
							onChange={onChange}
							onBlur={onNewTag}
							maxLength={25}
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
