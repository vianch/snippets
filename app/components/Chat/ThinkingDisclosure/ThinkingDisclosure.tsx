"use client";

import { ReactElement, useState } from "react";

/* Components */
import Sparkle from "@/components/ui/icons/Sparkle";

/* Styles */
import styles from "./thinkingDisclosure.module.css";

type ThinkingDisclosureProps = {
	isActive: boolean;
	text: string;
};

const ThinkingDisclosure = ({
	isActive,
	text,
}: ThinkingDisclosureProps): ReactElement | null => {
	const [isExpanded, setIsExpanded] = useState<boolean>(false);

	const hasText = text.length > 0;

	if (!isActive && !hasText) {
		return null;
	}

	const handleToggle = (): void => {
		if (!hasText) {
			return;
		}

		setIsExpanded((previous) => !previous);
	};

	return (
		<div className={styles.wrapper}>
			<button
				type="button"
				className={styles.toggle}
				onClick={handleToggle}
				disabled={!hasText}
				aria-expanded={isExpanded}
			>
				<span
					className={`${styles.sparkle} ${isActive ? styles.sparkleActive : ""}`}
				>
					<Sparkle width={14} height={14} />
				</span>
				<span className={isActive ? styles.labelActive : styles.label}>
					{isActive ? "Thinking…" : "Thinking"}
				</span>
				{hasText && (
					<svg
						className={`${styles.chevron} ${isExpanded ? styles.chevronOpen : ""}`}
						width="10"
						height="10"
						viewBox="0 0 10 10"
						fill="none"
						aria-hidden="true"
					>
						<path
							d="M3.5 2 L6.5 5 L3.5 8"
							stroke="currentColor"
							strokeWidth="1.4"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				)}
			</button>

			{isExpanded && hasText && <div className={styles.body}>{text}</div>}
		</div>
	);
};

export default ThinkingDisclosure;
