import { ReactElement, ChangeEvent } from "react";

/* Components */
import Input from "@/components/ui/Input/Input";

/* Styles */
import styles from "../codeEditor.module.css";

type SnippetDetailsProps = {
	currentSnippet: CurrentSnippet;
	isMobile: boolean;
	onClose: () => void;
	onUrlChange: (event: ChangeEvent<HTMLInputElement>) => void;
	onNotesChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
};

const SnippetDetails = ({
	currentSnippet,
	isMobile,
	onClose,
	onUrlChange,
	onNotesChange,
}: SnippetDetailsProps): ReactElement => {
	return (
		<>
			{!isMobile && <div className={styles.detailsOverlay} onClick={onClose} />}
			<div
				className={isMobile ? styles.detailsPanelMobile : styles.detailsPanel}
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
