import { ChangeEvent, Fragment, ReactElement, useRef } from "react";

/* Lib */
import { markdownFileAccept } from "@/lib/constants/markdown.constants";
import {
	downloadMarkdownFile,
	insertTextIntoEditor,
} from "@/lib/markdown/markdownFileActions";
import markdownToolbarActions from "@/lib/markdown/markdownToolbarActions";

/* Components */
import Download from "@/components/ui/icons/Download";
import EyeClosed from "@/components/ui/icons/EyeClosed";
import EyeOpen from "@/components/ui/icons/EyeOpen";
import Folder from "@/components/ui/icons/Folder";

/* Types */
import type { EditorView } from "@codemirror/view";

/* Styles */
import styles from "./markdownToolbar.module.css";

type MarkdownToolbarProps = {
	getEditorView: () => EditorView | null;
	isPreviewVisible: boolean;
	onTogglePreview: () => void;
	showFormattingActions: boolean;
	showPreviewToggle: boolean;
	snippetFileName: string;
};

const MarkdownToolbar = ({
	getEditorView,
	isPreviewVisible,
	onTogglePreview,
	showFormattingActions,
	showPreviewToggle,
	snippetFileName,
}: MarkdownToolbarProps): ReactElement => {
	const fileInputRef = useRef<HTMLInputElement>(null);

	const runAction = (apply: (view: EditorView) => void): void => {
		const editorView = getEditorView();

		if (!editorView) {
			return;
		}

		apply(editorView);
	};

	const handleOpenFileClick = (): void => {
		fileInputRef.current?.click();
	};

	const handleFileSelection = (event: ChangeEvent<HTMLInputElement>): void => {
		const selectedFile = event.target.files?.[0];

		event.target.value = "";

		if (!selectedFile) {
			return;
		}

		selectedFile.text().then((fileText) => {
			runAction((view) => insertTextIntoEditor(view, fileText));
		});
	};

	const handleDownloadClick = (): void => {
		runAction((view) =>
			downloadMarkdownFile(snippetFileName, view.state.doc.toString())
		);
	};

	const previewToggleLabel = isPreviewVisible ? "Hide preview" : "Show preview";

	return (
		<div
			aria-label={
				showFormattingActions ? "Markdown formatting" : "Editor toolbar"
			}
			className={styles.toolbar}
			role="toolbar"
		>
			{showFormattingActions && (
				<>
					<input
						accept={markdownFileAccept}
						className={styles.hiddenFileInput}
						onChange={handleFileSelection}
						ref={fileInputRef}
						type="file"
					/>
					<button
						aria-label="Open markdown file"
						className={styles.toolbarButton}
						onClick={handleOpenFileClick}
						title="Open markdown file"
						type="button"
					>
						<Folder height={16} width={16} />
					</button>
					<button
						aria-label="Download markdown file"
						className={styles.toolbarButton}
						onClick={handleDownloadClick}
						title="Download markdown file"
						type="button"
					>
						<Download height={16} width={16} />
					</button>
					<span aria-hidden="true" className={styles.divider} />
				</>
			)}
			{showFormattingActions &&
				markdownToolbarActions.map((action) => {
					const ActionIcon = action.icon;

					return (
						<Fragment key={action.label}>
							{action.hasDividerBefore ? (
								<span aria-hidden="true" className={styles.divider} />
							) : null}
							<button
								aria-label={action.label}
								className={styles.toolbarButton}
								onClick={() => runAction(action.apply)}
								title={action.label}
								type="button"
							>
								<ActionIcon height={16} width={16} />
							</button>
						</Fragment>
					);
				})}
			{showPreviewToggle && (
				<button
					aria-label={previewToggleLabel}
					aria-pressed={isPreviewVisible}
					className={`${styles.toolbarButton} ${styles.previewToggle}`}
					onClick={onTogglePreview}
					title={previewToggleLabel}
					type="button"
				>
					{isPreviewVisible ? (
						<EyeOpen height={16} width={16} />
					) : (
						<EyeClosed height={16} width={16} />
					)}
				</button>
			)}
		</div>
	);
};

export default MarkdownToolbar;
