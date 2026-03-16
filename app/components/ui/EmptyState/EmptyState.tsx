import { ReactElement } from "react";

/* Styles */
import styles from "./emptyState.module.css";

type IllustrationType = "code" | "cursor" | "search" | "trash" | "clock";

type EmptyStateProps = {
	title: string;
	description?: string;
	illustration?: IllustrationType;
	actionLabel?: string;
	onAction?: () => void;
};

const illustrations: Record<IllustrationType, ReactElement> = {
	code: (
		<svg
			width="64"
			height="64"
			viewBox="0 0 64 64"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<rect
				x="8"
				y="8"
				width="48"
				height="48"
				rx="4"
				stroke="currentColor"
				strokeWidth="2"
				opacity="0.3"
			/>
			<path
				d="M24 26L16 32L24 38"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
				opacity="0.6"
			/>
			<path
				d="M40 26L48 32L40 38"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
				opacity="0.6"
			/>
			<path
				d="M35 22L29 42"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				opacity="0.4"
			/>
		</svg>
	),
	cursor: (
		<svg
			width="64"
			height="64"
			viewBox="0 0 64 64"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<rect
				x="12"
				y="8"
				width="40"
				height="48"
				rx="4"
				stroke="currentColor"
				strokeWidth="2"
				opacity="0.3"
			/>
			<path
				d="M20 20H44"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				opacity="0.2"
			/>
			<path
				d="M20 28H38"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				opacity="0.2"
			/>
			<path
				d="M20 36H42"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				opacity="0.2"
			/>
			<path
				d="M28 44L28 32L38 40L32 41L28 44Z"
				fill="currentColor"
				opacity="0.5"
			/>
		</svg>
	),
	search: (
		<svg
			width="64"
			height="64"
			viewBox="0 0 64 64"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<circle
				cx="28"
				cy="28"
				r="14"
				stroke="currentColor"
				strokeWidth="2"
				opacity="0.3"
			/>
			<path
				d="M38 38L50 50"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				opacity="0.3"
			/>
			<path
				d="M22 28H34"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				opacity="0.4"
			/>
		</svg>
	),
	trash: (
		<svg
			width="64"
			height="64"
			viewBox="0 0 64 64"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M16 18H48"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				opacity="0.3"
			/>
			<path
				d="M24 18V14C24 12.8954 24.8954 12 26 12H38C39.1046 12 40 12.8954 40 14V18"
				stroke="currentColor"
				strokeWidth="2"
				opacity="0.3"
			/>
			<path
				d="M18 18L20 52C20 53.1046 20.8954 54 22 54H42C43.1046 54 44 53.1046 44 52L46 18"
				stroke="currentColor"
				strokeWidth="2"
				opacity="0.3"
			/>
			<path
				d="M28 36L36 36"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				opacity="0.2"
			/>
		</svg>
	),
	clock: (
		<svg
			width="64"
			height="64"
			viewBox="0 0 64 64"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<circle
				cx="32"
				cy="32"
				r="22"
				stroke="currentColor"
				strokeWidth="2"
				opacity="0.3"
			/>
			<path
				d="M32 20V32L40 36"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
				opacity="0.4"
			/>
			<circle cx="32" cy="32" r="2" fill="currentColor" opacity="0.3" />
		</svg>
	),
};

const EmptyState = ({
	title,
	description,
	illustration = "code",
	actionLabel,
	onAction,
}: EmptyStateProps): ReactElement => (
	<div className={styles.container}>
		<div className={styles.illustration}>{illustrations[illustration]}</div>
		<h3 className={styles.title}>{title}</h3>
		{description && <p className={styles.description}>{description}</p>}
		{actionLabel && onAction && (
			<button type="button" className={styles.actionButton} onClick={onAction}>
				{actionLabel}
			</button>
		)}
	</div>
);

export default EmptyState;
