"use client";

import { ReactElement } from "react";

/* Components */
import Card from "@/components/ui/Card/Card";
import Skeleton from "@/components/ui/Skeleton/Skeleton";

/* Styles */
import styles from "./snippetAnalytics.module.css";

// Loading placeholder mirroring the real analytics layout (stat cards + every
// panel) so nothing shifts when data arrives.
const AnalyticsSkeleton = (): ReactElement => {
	return (
		<div className={styles.container}>
			<div className={styles.grid}>
				{Array.from({ length: 11 }, (_, index) => (
					<Skeleton
						key={index}
						height="7.5rem"
						borderRadius="var(--border-radius-lg)"
					/>
				))}
			</div>

			<div className={styles.panelRow}>
				<Card title="Creation trend" subtitle="Snippets created over time">
					<Skeleton height="200px" borderRadius="var(--border-radius-md)" />
				</Card>
				<Card title="Language mix" subtitle="Distribution by language">
					<Skeleton height="200px" borderRadius="var(--border-radius-md)" />
				</Card>
			</div>

			<div className={styles.panelRow}>
				<Card title="Top languages" subtitle="Snippets per language">
					<Skeleton height="220px" borderRadius="var(--border-radius-md)" />
				</Card>
				<Card title="Top contributors" subtitle="Most active users">
					<ul className={styles.rankList}>
						{Array.from({ length: 5 }, (_, index) => (
							<li className={styles.rankItem} key={index}>
								<Skeleton height="0.75rem" />
								<Skeleton height="0.5rem" />
								<Skeleton width="1.5rem" height="0.75rem" />
							</li>
						))}
					</ul>
				</Card>
			</div>

			<div className={styles.panelRow}>
				<Card title="Top folders" subtitle="Snippets per folder">
					<ul className={styles.rankList}>
						{Array.from({ length: 5 }, (_, index) => (
							<li className={styles.rankItem} key={index}>
								<Skeleton height="0.75rem" />
								<Skeleton height="0.5rem" />
								<Skeleton width="1.5rem" height="0.75rem" />
							</li>
						))}
					</ul>
				</Card>
				<Card title="Saved searches" subtitle="Popular smart groups">
					<ul className={styles.rankList}>
						{Array.from({ length: 5 }, (_, index) => (
							<li className={styles.rankItem} key={index}>
								<Skeleton height="0.75rem" />
								<Skeleton height="0.5rem" />
								<Skeleton width="1.5rem" height="0.75rem" />
							</li>
						))}
					</ul>
				</Card>
			</div>

			<Card title="Top tags" subtitle="Most-used tags across snippets">
				<Skeleton height="220px" borderRadius="var(--border-radius-md)" />
			</Card>
		</div>
	);
};

export default AnalyticsSkeleton;
