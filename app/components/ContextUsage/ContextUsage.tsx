"use client";

import { ReactElement } from "react";

/* Lib */
import {
	ContextUsageDangerThreshold,
	ContextUsageWarnThreshold,
} from "@/lib/constants/ai";

/* Utils */
import { formatTokens } from "@/utils/ai.utils";

/* Styles */
import styles from "./contextUsage.module.css";

type ContextUsageProps = {
	usage: AiUsage | null;
};

const ContextUsage = ({ usage }: ContextUsageProps): ReactElement | null => {
	if (!usage || usage.contextWindow <= 0) {
		return null;
	}

	const used = usage.inputTokens + usage.outputTokens;
	const percent = Math.min(100, (used / usage.contextWindow) * 100);
	const fillClass =
		percent >= ContextUsageDangerThreshold
			? styles.fillDanger
			: percent >= ContextUsageWarnThreshold
				? styles.fillWarn
				: styles.fillOk;
	const title = `Context used: ${used.toLocaleString()} of ${usage.contextWindow.toLocaleString()} tokens (${percent.toFixed(1)}%) — input ${usage.inputTokens.toLocaleString()}, output ${usage.outputTokens.toLocaleString()}`;

	return (
		<div className={styles.wrapper} title={title} aria-label={title}>
			<span className={styles.label}>
				{formatTokens(used)} / {formatTokens(usage.contextWindow)} tokens
			</span>
			<div className={styles.bar}>
				<div
					className={`${styles.fill} ${fillClass}`}
					style={{ width: `${percent}%` }}
				/>
			</div>
			<span className={styles.percent}>{percent.toFixed(0)}%</span>
		</div>
	);
};

export default ContextUsage;
