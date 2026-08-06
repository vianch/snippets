"use client";

import {
	ChangeEvent,
	ReactElement,
	RefObject,
	useLayoutEffect,
	useState,
} from "react";

/* Components */
import FolderField from "@/components/CodeEditor/SnippetDetails/FolderField";
import Input from "@/components/ui/Input/Input";
import TagsField from "@/components/CodeEditor/SnippetDetails/TagsField";

/* Utils */
import { useCloseOnResize } from "@/utils/ui.utils";

/* Styles */
import styles from "../codeEditor.module.css";

type SnippetDetailsProps = {
	currentSnippet: CurrentSnippet;
	anchorRef: RefObject<HTMLButtonElement | null>;
	isMobile: boolean;
	tagList: string[];
	availableTags?: TagItem[];
	availableFolders?: TagItem[];
	onClose: () => void;
	onNewTag: (tag: string) => void;
	onRemoveTag: (tag: string) => void;
	onTouched: (touched: boolean) => void;
	onUrlChange: (event: ChangeEvent<HTMLInputElement>) => void;
	onNotesChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
	onFolderChange: (folder: string) => void;
};

const SnippetDetails = ({
	currentSnippet,
	anchorRef,
	isMobile,
	tagList,
	availableTags,
	availableFolders,
	onClose,
	onNewTag,
	onRemoveTag,
	onTouched,
	onUrlChange,
	onNotesChange,
	onFolderChange,
}: SnippetDetailsProps): ReactElement => {
	const [coords, setCoords] = useState<{ left: number; top: number }>({
		left: 0,
		top: 0,
	});

	// The panel hangs off the ⓘ button, whose x position moves with the title
	// input's width, so it cannot be expressed in CSS. Measured on open only —
	// the panel closes on resize rather than tracking the anchor.
	useCloseOnResize(onClose);

	useLayoutEffect(() => {
		const anchor = anchorRef.current;

		if (isMobile || !anchor) {
			return;
		}

		const rect = anchor.getBoundingClientRect();

		setCoords({ left: rect.left, top: rect.bottom + 4 });
	}, [anchorRef, isMobile]);

	return (
		<>
			{!isMobile && <div className={styles.detailsOverlay} onClick={onClose} />}
			<div
				className={isMobile ? styles.detailsPanelMobile : styles.detailsPanel}
				style={isMobile ? undefined : { left: coords.left, top: coords.top }}
			>
				<div className={styles.detailsHeader}>
					<span className={styles.detailsTitle}>Snippet Details</span>
					<button
						type="button"
						className={styles.detailsClose}
						onClick={onClose}
					>
						&times;
					</button>
				</div>
				<div className={styles.detailsContainer}>
					<TagsField
						tagList={tagList}
						availableTags={availableTags}
						onNewTag={onNewTag}
						onRemoveTag={onRemoveTag}
						onTouched={onTouched}
					/>

					<FolderField
						folder={currentSnippet?.folder}
						availableFolders={availableFolders}
						onFolderChange={onFolderChange}
					/>

					<div className={styles.detailsField}>
						<label className={styles.detailsLabel}>Source URL</label>
						<Input
							placeholder="https://..."
							value={currentSnippet?.url ?? ""}
							onChange={onUrlChange}
							maxLength={200}
							disableMargin
						/>
					</div>

					<div className={styles.detailsField}>
						<label className={styles.detailsLabel}>Notes</label>
						<textarea
							className={styles.notesField}
							placeholder="Add notes about this snippet..."
							value={currentSnippet?.notes ?? ""}
							onChange={onNotesChange}
							maxLength={500}
							rows={4}
						/>
					</div>

					{currentSnippet.is_public && currentSnippet.public_slug && (
						<div className={styles.detailsField}>
							<label className={styles.detailsLabel}>Public link</label>
							<a
								className={styles.publicLink}
								href={`/s/${currentSnippet.public_slug}`}
								target="_blank"
								rel="noopener noreferrer"
							>
								{`${typeof window !== "undefined" ? window.location.origin : ""}/s/${currentSnippet.public_slug}`}
							</a>
						</div>
					)}
				</div>
			</div>
		</>
	);
};

export default SnippetDetails;
