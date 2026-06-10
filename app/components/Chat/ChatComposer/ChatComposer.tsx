"use client";

import { ChangeEvent, KeyboardEvent, ReactElement, RefObject } from "react";

/* Components */
import WikiLinkPopover from "@/components/Chat/WikiLinkPopover/WikiLinkPopover";
import ContextUsage from "@/components/ContextUsage/ContextUsage";
import ModelSelector from "@/components/ModelSelector/ModelSelector";

/* Styles */
import styles from "./chatComposer.module.css";

type ChatComposerProps = {
	inputDisabled: boolean;
	inputValue: string;
	isProcessing: boolean;
	lastUsage: AiUsage | null;
	onInputChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
	onInputSelect: () => void;
	onKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
	onSend: () => void;
	onStop: () => void;
	onWikiDismiss: () => void;
	onWikiSelect: (name: string) => void;
	placeholder: string;
	sendDisabled: boolean;
	showModelSelector?: boolean;
	snippets: Snippet[];
	textareaRef: RefObject<HTMLTextAreaElement | null>;
	unresolvedWikiTokens: string[];
	wikiContext: WikiLinkContext | null;
};

const ChatComposer = ({
	inputDisabled,
	inputValue,
	isProcessing,
	lastUsage,
	onInputChange,
	onInputSelect,
	onKeyDown,
	onSend,
	onStop,
	onWikiDismiss,
	onWikiSelect,
	placeholder,
	sendDisabled,
	showModelSelector = false,
	snippets,
	textareaRef,
	unresolvedWikiTokens,
	wikiContext,
}: ChatComposerProps): ReactElement => (
	<div className={styles.dock}>
		<div className={styles.inputWrap}>
			<WikiLinkPopover
				isOpen={wikiContext !== null}
				query={wikiContext?.query ?? ""}
				snippets={snippets}
				onSelect={onWikiSelect}
				onDismiss={onWikiDismiss}
			/>
			<div className={styles.inputRow}>
				<textarea
					ref={textareaRef}
					className={styles.prompt}
					placeholder={placeholder}
					rows={1}
					value={inputValue}
					disabled={inputDisabled}
					onChange={onInputChange}
					onKeyDown={onKeyDown}
					onSelect={onInputSelect}
					onClick={onInputSelect}
				/>
				{isProcessing ? (
					<button
						type="button"
						className={styles.stopButton}
						onClick={onStop}
						aria-label="Stop"
					>
						<svg width={10} height={10} viewBox="0 0 10 10">
							<rect width={10} height={10} rx={2} fill="currentColor" />
						</svg>
					</button>
				) : (
					<button
						type="button"
						className={styles.sendButton}
						onClick={onSend}
						disabled={sendDisabled}
						aria-label="Send"
					>
						<svg width={14} height={14} viewBox="0 0 14 14" fill="none">
							<path
								d="M7 12 V2 M7 2 L3 6 M7 2 L11 6"
								stroke="currentColor"
								strokeWidth={1.8}
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</button>
				)}
			</div>
			{unresolvedWikiTokens.length > 0 && (
				<div className={styles.unresolvedHint}>
					{unresolvedWikiTokens.map((token) => (
						<span key={token}>
							No snippet found for <code>[[{token}]]</code>
						</span>
					))}
				</div>
			)}
			<div className={styles.dockHint}>
				<div className={styles.dockHintLeft}>
					{showModelSelector && <ModelSelector compact />}
					<ContextUsage usage={lastUsage} />
				</div>
				<span>
					<span className={styles.kbdInline}>↵</span> send ·{" "}
					<span className={styles.kbdInline}>⇧↵</span> newline ·{" "}
					<span className={styles.kbdInline}>[[</span> link snippet
				</span>
			</div>
		</div>
	</div>
);

export default ChatComposer;
