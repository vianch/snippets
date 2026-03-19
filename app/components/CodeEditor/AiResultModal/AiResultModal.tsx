"use client";

import { ReactElement, useMemo } from "react";
import CodeMirror from "@uiw/react-codemirror";

/* Lib */
import { aiActionLabels, codeActions } from "@/lib/constants/ai";
import { getCodeMirrorTheme, ThemeName } from "@/lib/config/themes";
import useUserStore from "@/lib/store/user.store";
import languageExtensions from "@/lib/codeEditor";
import SupportedLanguages from "@/lib/config/languages";

/* Components */
import Modal from "@/components/ui/Modal/Modal";
import Button from "@/components/ui/Button/Button";
import Loading from "@/components/ui/icons/Loading";

/* Styles */
import styles from "./aiResultModal.module.css";

type AiResultModalProps = {
	isOpen: boolean;
	isLoading: boolean;
	action: AiAction | null;
	result: string;
	error: string;
	language: SupportedLanguages;
	onApply: () => void;
	onDiscard: () => void;
};

const AiResultModal = ({
	isOpen,
	isLoading,
	action,
	result,
	error,
	language,
	onApply,
	onDiscard,
}: AiResultModalProps): ReactElement => {
	const theme = useUserStore((state) => state.theme) as ThemeName;
	const editorTheme = useMemo(() => getCodeMirrorTheme(theme), [theme]);
	const isCodeAction = action ? codeActions.includes(action) : false;
	const title = action ? aiActionLabels[action] : "AI Result";

	const extension = useMemo(
		() => languageExtensions[language] || [],
		[language]
	);

	return (
		<Modal
			isOpen={isOpen}
			onClose={onDiscard}
			title={title}
			className={styles.aiModal}
		>
			<div className={styles.container}>
				{isLoading ? (
					<div className={styles.loadingContainer}>
						<Loading width={32} height={32} />
						<span className={styles.loadingText}>Thinking...</span>
					</div>
				) : error && !result ? (
					<div className={styles.errorContainer}>
						<p className={styles.errorText}>{error}</p>
					</div>
				) : isCodeAction ? (
					<>
						{error && result && (
							<div className={styles.warningContainer}>
								<p className={styles.warningText}>{error}</p>
							</div>
						)}
						<div className={styles.codeContainer}>
							<CodeMirror
								value={result}
								extensions={extension ? [extension] : []}
								theme={editorTheme}
								readOnly
								height="400px"
								basicSetup={{ lineNumbers: true }}
							/>
						</div>
					</>
				) : (
					<div className={styles.explanationContainer}>
						<pre className={styles.explanationText}>{result}</pre>
					</div>
				)}

				<div className={styles.actions}>
					{isCodeAction && !isLoading && result && (
						<Button onClick={onApply} className={styles.applyButton}>
							Apply
						</Button>
					)}
					<Button
						variant="secondary"
						onClick={onDiscard}
						className={styles.discardButton}
					>
						{isCodeAction ? "Discard" : "Close"}
					</Button>
				</div>
			</div>
		</Modal>
	);
};

export default AiResultModal;
