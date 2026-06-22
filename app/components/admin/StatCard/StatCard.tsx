"use client";

import { CSSProperties, ReactElement } from "react";

/* Components */
import AnimatedCounter from "@/components/admin/AnimatedCounter/AnimatedCounter";
import Card from "@/components/ui/Card/Card";

/* Styles */
import styles from "./statCard.module.css";

type StatCardProps = {
	accentVar?: string;
	decimals?: number;
	delayMs?: number;
	footnote?: string;
	footnoteTone?: "down" | "muted" | "up";
	icon: ReactElement;
	label: string;
	value: number;
};

const StatCard = ({
	accentVar = "--purple-color",
	decimals = 0,
	delayMs = 0,
	footnote,
	footnoteTone = "muted",
	icon,
	label,
	value,
}: StatCardProps): ReactElement => {
	// Custom properties aren't part of the typed CSSProperties surface.
	const cardStyle = {
		"--stat-accent": `var(${accentVar})`,
		animationDelay: `${delayMs}ms`,
	} as CSSProperties;

	return (
		<Card className={styles.statCard} style={cardStyle}>
			<div className={styles.head}>
				<span className={styles.label}>{label}</span>
				<span className={styles.icon}>{icon}</span>
			</div>

			<div className={styles.value}>
				<AnimatedCounter value={value} decimals={decimals} />
			</div>

			{footnote && (
				<div className={`${styles.footnote} ${styles[footnoteTone]}`}>
					{footnote}
				</div>
			)}
		</Card>
	);
};

export default StatCard;
