"use client";

import { ReactElement, useEffect, useRef, useState } from "react";

/* Components */
import Modal from "@/components/ui/Modal/Modal";
import Button from "@/components/ui/Button/Button";
import Camera from "@/components/ui/icons/Camera";
import SnapshotCard from "./SnapshotCard/SnapshotCard";
import SnapshotControls from "./SnapshotControls/SnapshotControls";

/* Lib */
import { getHighlightedCode } from "@/lib/config/shiki";
import {
	defaultSnapshotOptions,
	fontOptions,
	SnapshotOptions,
} from "@/lib/constants/screenshot";

/* Utils */
import {
	captureElement,
	downloadImage,
	loadFont,
} from "@/utils/screenshot.utils";

/* Styles */
import styles from "./screenshotModal.module.css";

type ScreenshotModalProps = {
	isOpen: boolean;
	onClose: () => void;
	snippet: Snippet;
};

const ScreenshotModal = ({
	isOpen,
	onClose,
	snippet,
}: ScreenshotModalProps): ReactElement => {
	const cardRef = useRef<HTMLDivElement>(null);
	const [options, setOptions] = useState<SnapshotOptions>(
		defaultSnapshotOptions
	);
	const [highlightedCode, setHighlightedCode] = useState<string>("");
	const [isCapturing, setIsCapturing] = useState<boolean>(false);

	useEffect(() => {
		if (!isOpen || !snippet.snippet) {
			return;
		}

		let cancelled = false;

		const escapedSnippet = snippet.snippet
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;");

		getHighlightedCode(snippet.snippet, snippet.language, options.theme)
			.then((html) => {
				if (!cancelled) {
					setHighlightedCode(html);
				}
			})
			.catch(() => {
				if (!cancelled) {
					setHighlightedCode(`<pre><code>${escapedSnippet}</code></pre>`);
				}
			});

		return () => {
			cancelled = true;
		};
	}, [isOpen, snippet.snippet, snippet.language, options.theme]);

	const handleDownload = async (): Promise<void> => {
		if (!cardRef.current || isCapturing) {
			return;
		}

		setIsCapturing(true);

		try {
			const selectedFont = fontOptions.find(
				(font) => font.value === options.fontFamily
			);

			await loadFont(options.fontFamily, selectedFont?.googleFamilyParam);

			const dataUrl = await captureElement(cardRef.current);

			downloadImage(dataUrl, snippet.name || "snippet");
		} finally {
			setIsCapturing(false);
		}
	};

	return (
		<Modal
			className={styles.modal}
			closeOnOverlayClick={false}
			isOpen={isOpen}
			showCloseButton
			title="Screenshot"
			onClose={onClose}
		>
			<div className={styles.layout}>
				<div className={styles.previewArea}>
					{highlightedCode && (
						<SnapshotCard
							cardRef={cardRef}
							highlightedCode={highlightedCode}
							options={options}
							snippetName={snippet.name || "snippet"}
						/>
					)}
				</div>

				<div className={styles.sidebar}>
					<SnapshotControls options={options} onOptionsChange={setOptions} />

					<div className={styles.downloadButtonWrapper}>
						<Button
							className={styles.downloadButton}
							disabled={isCapturing || !highlightedCode}
							variant="primary"
							onClick={handleDownload}
						>
							<Camera height={16} width={16} />
							{isCapturing ? "Capturing..." : "Download PNG"}
						</Button>
					</div>
				</div>
			</div>
		</Modal>
	);
};

export default ScreenshotModal;
