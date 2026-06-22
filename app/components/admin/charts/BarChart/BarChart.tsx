"use client";

import { ReactElement, useEffect, useState } from "react";

/* Constants */
import { ChartPalette } from "@/lib/constants/admin.constants";

/* Styles */
import styles from "./barChart.module.css";

type BarChartProps = {
	data: ChartDatum[];
};

const BarChart = ({ data }: BarChartProps): ReactElement => {
	const [mounted, setMounted] = useState<boolean>(false);
	const max = Math.max(1, ...data.map((datum) => datum.value));

	useEffect(() => {
		const frame = requestAnimationFrame(() => setMounted(true));

		return () => cancelAnimationFrame(frame);
	}, []);

	return (
		<div className={styles.chart}>
			{data.map((datum, index) => {
				const accentVar = ChartPalette[index % ChartPalette.length];
				const accent = datum.color ?? `var(${accentVar ?? "--purple-color"})`;
				const heightPercent = mounted ? (datum.value / max) * 100 : 0;

				return (
					<div className={styles.column} key={datum.label}>
						<div className={styles.track}>
							<span className={styles.value}>{datum.value}</span>
							<div
								className={styles.bar}
								style={{ background: accent, height: `${heightPercent}%` }}
								title={`${datum.label}: ${datum.value}`}
							/>
						</div>
						<span className={styles.label} title={datum.label}>
							{datum.label}
						</span>
					</div>
				);
			})}
		</div>
	);
};

export default BarChart;
