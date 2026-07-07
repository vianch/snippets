"use client";

import { ReactElement, useEffect, useRef, useState } from "react";

/* Lib */
import SupportedLanguages from "@/lib/config/languages";
import { prepareConsoleCode } from "@/lib/consoleRunner";
import {
	ConsoleEntryLevels,
	ConsoleMessageLevel,
	ConsoleMessageSource,
	ConsoleRunMessageSource,
	ConsoleRunTimeoutMs,
	ConsoleSandboxDocument,
} from "@/lib/constants/preview.constants";

/* Components */
import Play from "@/components/ui/icons/Play";
import Trash from "@/components/ui/icons/Trash";

/* Styles */
import styles from "./codeConsole.module.css";

type CodeConsoleProps = {
	code: string;
	height: string;
	language: SupportedLanguages;
};

const CodeConsole = ({
	code,
	height,
	language,
}: CodeConsoleProps): ReactElement => {
	const [entries, setEntries] = useState<ConsoleEntry[]>([]);
	const [isRunning, setIsRunning] = useState(false);
	const [sandboxGeneration, setSandboxGeneration] = useState(0);
	const iframeRef = useRef<HTMLIFrameElement | null>(null);
	const nextEntryIdRef = useRef(0);
	const pendingCodeRef = useRef<string | null>(null);
	const timeoutRef = useRef<number | null>(null);

	const appendEntry = (level: ConsoleMessageLevel, text: string): void => {
		nextEntryIdRef.current += 1;

		const entry: ConsoleEntry = { id: nextEntryIdRef.current, level, text };

		setEntries((previousEntries) => [...previousEntries, entry]);
	};

	const clearRunTimeout = (): void => {
		if (timeoutRef.current !== null) {
			window.clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}
	};

	useEffect(() => {
		const handleSandboxMessage = (event: MessageEvent): void => {
			// Only trust messages coming from our own sandbox frame
			if (event.source !== iframeRef.current?.contentWindow) {
				return;
			}

			// Shape assumed for field access only — every field the frame sends
			// is attacker-controlled and re-validated below before use
			const data = event.data as ConsoleSandboxMessage;

			if (!data || data.source !== ConsoleMessageSource) {
				return;
			}

			if (data.level === ConsoleMessageLevel.Done) {
				clearRunTimeout();
				setIsRunning(false);

				return;
			}

			if (
				!ConsoleEntryLevels.includes(data.level) ||
				typeof data.text !== "string"
			) {
				return;
			}

			appendEntry(data.level, data.text);
		};

		window.addEventListener("message", handleSandboxMessage);

		return () => {
			window.removeEventListener("message", handleSandboxMessage);
		};
	}, []);

	useEffect(() => clearRunTimeout, []);

	const runHandler = async (): Promise<void> => {
		if (isRunning) {
			return;
		}

		setEntries([]);
		setIsRunning(true);

		try {
			pendingCodeRef.current = await prepareConsoleCode(code, language);

			// Remount the frame so timers and promises left over from the
			// previous run die before this run starts; handleFrameLoad posts
			// the pending code once the fresh frame is ready.
			setSandboxGeneration((generation) => generation + 1);
		} catch (transpileError) {
			appendEntry(
				ConsoleMessageLevel.Error,
				transpileError instanceof Error
					? transpileError.message
					: String(transpileError)
			);
			setIsRunning(false);
		}
	};

	const handleFrameLoad = (): void => {
		const sandboxWindow = iframeRef.current?.contentWindow;
		const pendingCode = pendingCodeRef.current;

		if (!sandboxWindow || pendingCode === null) {
			return;
		}

		pendingCodeRef.current = null;

		timeoutRef.current = window.setTimeout(() => {
			timeoutRef.current = null;
			appendEntry(ConsoleMessageLevel.Error, "Execution timed out");
			setIsRunning(false);

			// Remount the frame to tear down whatever is still running in it
			setSandboxGeneration((generation) => generation + 1);
		}, ConsoleRunTimeoutMs);

		// An opaque sandbox origin can only be targeted with "*"
		sandboxWindow.postMessage(
			{ code: pendingCode, source: ConsoleRunMessageSource },
			"*"
		);
	};

	return (
		<div className={styles.consoleContainer} style={{ height }}>
			<div className={styles.consoleHeader}>
				<span className={styles.consoleTitle}>Console</span>
				<div className={styles.consoleActions}>
					<button
						aria-label="Run code"
						className={styles.consoleButton}
						disabled={isRunning}
						onClick={runHandler}
						title="Run code"
						type="button"
					>
						<Play height={14} width={14} />
					</button>
					<button
						aria-label="Clear console"
						className={styles.consoleButton}
						onClick={() => setEntries([])}
						title="Clear console"
						type="button"
					>
						<Trash height={14} width={14} />
					</button>
				</div>
			</div>
			<div className={styles.consoleOutput}>
				{entries.length === 0 ? (
					<span className={styles.consoleEmpty}>
						{isRunning ? "Running…" : "Press run to execute the snippet"}
					</span>
				) : (
					entries.map((entry) => (
						<div
							className={`${styles.consoleEntry} ${styles[entry.level] ?? ""}`}
							key={entry.id}
						>
							{entry.text}
						</div>
					))
				)}
			</div>
			{/* allow-scripts only: opaque origin, no cookies/storage/parent DOM;
			    the document's CSP additionally denies all network access */}
			<iframe
				className={styles.sandboxFrame}
				key={sandboxGeneration}
				onLoad={handleFrameLoad}
				ref={iframeRef}
				sandbox="allow-scripts"
				srcDoc={ConsoleSandboxDocument}
				title="Code execution sandbox"
			/>
		</div>
	);
};

export default CodeConsole;
