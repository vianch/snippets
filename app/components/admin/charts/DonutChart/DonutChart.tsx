"use client";

import { ReactElement, useEffect, useState } from "react";

/* Constants */
import { ChartPalette } from "@/lib/constants/admin.constants";

/* Styles */
import styles from "./donutChart.module.css";

type DonutChartProps = {
	centerLabel?: string;
	centerValue?: string;
	data: ChartDatum[];
};

const DonutChart = ({
	centerLabel,
	centerValue,
	data,
}: DonutChartProps): ReactElement => {
	const [mounted, setMounted] = useState<boolean>(false);
	const radius = 60;
	const strokeWidth = 22;
	const circumference = 2 * Math.PI * radius;
	const total = Math.max(
		1,
		data.reduce((sum, datum) => sum + datum.value, 0)
	);
	const segments = data.map((datum, index) => {
		const accentVar = ChartPalette[index % ChartPalette.length];
		const priorTotal = data
			.slice(0, index)
			.reduce((sum, prior) => sum + prior.value, 0);

		return {
			color: datum.color ?? `var(${accentVar ?? "--purple-color"})`,
			fraction: datum.value / total,
			label: datum.label,
			priorFraction: priorTotal / total,
			value: datum.value,
		};
	});

	useEffect(() => {
		const frame = requestAnimationFrame(() => setMounted(true));

		return () => cancelAnimationFrame(frame);
	}, []);

	return (
		<div className={styles.donut}>
			<div className={styles.ring}>
				<svg
					viewBox="0 0 160 160"
					className={styles.svg}
					role="img"
					aria-label="Distribution"
				>
					<g transform="rotate(-90 80 80)">
						<circle
							cx="80"
							cy="80"
							r={radius}
							fill="none"
							stroke="var(--current-line)"
							strokeWidth={strokeWidth}
						/>
						{segments.map((segment) => {
							const dash = mounted ? segment.fraction * circumference : 0;

							return (
								<circle
									key={segment.label}
									className={styles.segment}
									cx="80"
									cy="80"
									r={radius}
									fill="none"
									stroke={segment.color}
									strokeWidth={strokeWidth}
									strokeDasharray={`${dash} ${circumference - dash}`}
									strokeDashoffset={-segment.priorFraction * circumference}
								>
									<title>{`${segment.label}: ${segment.value}`}</title>
								</circle>
							);
						})}
					</g>
				</svg>

				{(centerValue || centerLabel) && (
					<div className={styles.center}>
						{centerValue && (
							<div className={styles.centerValue}>{centerValue}</div>
						)}
						{centerLabel && (
							<div className={styles.centerLabel}>{centerLabel}</div>
						)}
					</div>
				)}
			</div>

			<ul className={styles.legend}>
				{segments.map((segment) => (
					<li className={styles.legendItem} key={`legend-${segment.label}`}>
						<span
							className={styles.legendDot}
							style={{ background: segment.color }}
						/>
						<span className={styles.legendLabel} title={segment.label}>
							{segment.label}
						</span>
						<span className={styles.legendValue}>{segment.value}</span>
					</li>
				))}
			</ul>
		</div>
	);
};

export default DonutChart;
