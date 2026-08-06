import { ChangeEvent, ReactElement, RefObject } from "react";

/* Lib */
import languageExtensions from "@/lib/codeEditor";
import { SnippetState } from "@/lib/constants/core";

/* Components */
import Badge from "@/components/ui/Badge/Badge";
import Button from "@/components/ui/Button/Button";
import Check from "@/components/ui/icons/Check";
import CodeEditorActionsMenu from "@/components/CodeEditor/CodeEditorActionsMenu";
import Floppy from "@/components/ui/icons/Floppy";
import Globe from "@/components/ui/icons/Globe";
import Info from "@/components/ui/icons/Info";
import Input from "@/components/ui/Input/Input";
import Loading from "@/components/ui/icons/Loading";
import Plus from "@/components/ui/icons/Plus";
import Select from "@/components/ui/Select/Select";
import Star from "@/components/ui/icons/Star";
import StarFilled from "@/components/ui/icons/StarFilled";

/* Styles */
import styles from "./codeEditor.module.css";

type CodeEditorHeaderTypes = {
	currentSnippet: CurrentSnippet;
	codeEditorStates: SnippetEditorStates;
	snippetName: string;
	allSnippets?: Snippet[];
	detailsAnchorRef: RefObject<HTMLButtonElement | null>;
	tagList: string[];
	hasVersions: boolean;
	hideAiButton?: boolean;
	isMobile: boolean;
	showDetails: boolean;
	showHistory: boolean;
	onApplyAiCode?: (code: string) => void;
	onCopyToSnippet?: (content: string) => void;
	onRemoveTag: (tag: string) => void;
	onReplaceSnippet?: (content: string) => void;
	onSave: () => void;
	onSetLanguage: (language: string) => void;
	onStarred: () => void;
	onToggleDetails: () => void;
	onToggleHistory: () => void;
	onTogglePublic: () => void;
	onUpdateName: (event: ChangeEvent<HTMLInputElement>) => void;
};

const CodeEditorHeader = ({
	currentSnippet,
	codeEditorStates,
	snippetName = "",
	allSnippets,
	detailsAnchorRef,
	tagList,
	hasVersions,
	hideAiButton,
	isMobile,
	showDetails,
	showHistory,
	onApplyAiCode,
	onCopyToSnippet,
	onRemoveTag,
	onReplaceSnippet,
	onSave,
	onSetLanguage,
	onStarred,
	onToggleDetails,
	onToggleHistory,
	onTogglePublic,
	onUpdateName,
}: CodeEditorHeaderTypes): ReactElement => {
	const { isSaving, touched } = codeEditorStates ?? {};
	const isFavorite = currentSnippet?.state === SnippetState.Favorite;
	const isPublic = currentSnippet?.is_public ?? false;

	return (
		<div className={styles.header}>
			<div className={styles.headerIdentity}>
				<button
					type="button"
					className={`${styles.iconButton} ${styles.starButton} ${isFavorite ? styles.starButtonActive : ""}`}
					aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
					aria-pressed={isFavorite}
					onClick={onStarred}
				>
					{isFavorite ? (
						<StarFilled height={18} width={18} fill="currentColor" />
					) : (
						<Star height={18} width={18} />
					)}
					<span className={styles.tooltip}>
						{isFavorite ? "Favorited" : "Favorite"}
					</span>
				</button>

				<Input
					ghost
					disableMargin
					className={styles.titleInput}
					placeholder="Untitled"
					value={snippetName}
					maxLength={34}
					onChange={onUpdateName}
				/>

				<button
					ref={detailsAnchorRef}
					type="button"
					className={`${styles.iconButton} ${showDetails ? styles.iconButtonActive : ""}`}
					aria-label="Snippet details"
					aria-expanded={showDetails}
					onClick={onToggleDetails}
				>
					<Info height={18} width={18} />
					<span className={styles.tooltip}>Details</span>
				</button>
			</div>

			{/* ponytail: 3-tag cap + per-chip ellipsis; add a +N chip if chips
			    visibly clip below ~1400px */}
			<div className={styles.headerTags}>
				{tagList.length > 0 ? (
					tagList.map((tag: string, index: number): ReactElement => (
						<Badge
							key={`${index + 1}-code-editor-tag`}
							className={styles.headerTagBadge}
							onRemove={() => onRemoveTag(tag)}
						>
							{tag ?? ""}
						</Badge>
					))
				) : (
					<button
						type="button"
						className={`${styles.headerChip} ${styles.headerChipGhost}`}
						aria-label="Add a tag"
						onClick={onToggleDetails}
					>
						<Plus height={12} width={12} />
						Add tag
					</button>
				)}
			</div>

			{isPublic && (
				<button
					type="button"
					className={`${styles.headerChip} ${styles.headerChipPublic}`}
					aria-label="This snippet is public — open details"
					onClick={onToggleDetails}
				>
					<Globe height={12} width={12} />
					Public
				</button>
			)}

			<div className={styles.headerActions}>
				<Select
					className={styles.headerSelect}
					value={currentSnippet.language}
					items={Object.keys(languageExtensions)}
					onSelect={onSetLanguage}
				/>

				<Button
					className={`${styles.saveButton} ${touched ? styles.touched : ""}`}
					variant="secondary"
					shape="pill"
					disabled={isSaving}
					aria-label="Save snippet"
					onClick={onSave}
				>
					{isSaving ? (
						<Loading className={styles.icon} width={16} height={16} />
					) : touched ? (
						<Floppy className={styles.icon} width={16} height={16} />
					) : (
						<Check className={styles.icon} width={16} height={16} />
					)}
					{isSaving ? "Saving" : touched ? "Save" : "Saved"}
					{touched && <span className={styles.dirtyDot} aria-hidden="true" />}
				</Button>

				<CodeEditorActionsMenu
					currentSnippet={currentSnippet}
					allSnippets={allSnippets}
					hasVersions={hasVersions}
					hideAiButton={hideAiButton}
					isMobile={isMobile}
					isPublic={isPublic}
					showHistory={showHistory}
					onApplyAiCode={onApplyAiCode}
					onCopyToSnippet={onCopyToSnippet}
					onReplaceSnippet={onReplaceSnippet}
					onToggleHistory={onToggleHistory}
					onTogglePublic={onTogglePublic}
				/>
			</div>
		</div>
	);
};

export default CodeEditorHeader;
