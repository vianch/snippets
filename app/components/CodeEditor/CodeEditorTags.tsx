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
	isPublic: boolean;
	showDetails: boolean;
	onNewTag: (tag: string) => void;
	onChange: (e: ChangeEvent<HTMLInputElement>) => void;
	onRemoveTag: (tag: string) => void;
	onToggleDetails: () => void;
	onTogglePublic: () => void;
};

const CodeEditorTags = ({
	activeTag,
	currentSnippet,
	isPublic,
	showDetails,
	onNewTag,
	onChange,
	onRemoveTag,
	onToggleDetails,
	onTogglePublic,
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
				<label>
					<Tag width={24} height={24} />{" "}
				</label>
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
							className={`inputField `}
							cleanOnBlur
							type="text"
							placeholder="New Tag"
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
					isPublic={isPublic}
					showDetails={showDetails}
					onToggleDetails={onToggleDetails}
					onTogglePublic={onTogglePublic}
				/>
			</div>
		</section>
	);
};

export default CodeEditorTags;
