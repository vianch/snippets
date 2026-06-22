"use client";

import { ReactElement } from "react";

/* Styles */
import styles from "./areaChart.module.css";

type AreaChartProps = {
	accentVar?: string;
	data: SnippetTrendPoint[];
};

const AreaChart = ({
	accentVar = "--cyan-color",
	data,
}: AreaChartProps): ReactElement => {
	const viewWidth = 600;
	const viewHeight = 200;
	const verticalPadding = 12;
	const max = Math.max(1, ...data.map((point) => point.count));
	const stepX = data.length > 1 ? viewWidth / (data.length - 1) : viewWidth;
	const points = data.map((point, index) => {
		const usableHeight = viewHeight - verticalPadding * 2;
		const x = index * stepX;
		const y = viewHeight - verticalPadding - (point.count / max) * usableHeight;

		return { x, y };
	});
	const linePath = points
		.map(
			(point, index) =>
				`${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`
		)
		.join(" ");
	const areaPath = points.length
		? `${linePath} L ${viewWidth} ${viewHeight} L 0 ${viewHeight} Z`
		: "";
	const labelStep = Math.max(1, Math.ceil(data.length / 6));
	const isVisibleLabel = (index: number): boolean =>
		index === 0 || index === data.length - 1 || index % labelStep === 0;

	return (
		<div className={styles.chart}>
			<svg
				className={styles.svg}
				viewBox={`0 0 ${viewWidth} ${viewHeight}`}
				preserveAspectRatio="none"
				role="img"
				aria-label="Snippet creation trend"
			>
				<defs>
					<linearGradient id="areaChartFill" x1="0" y1="0" x2="0" y2="1">
						<stop
							offset="0%"
							stopColor={`var(${accentVar})`}
							stopOpacity="0.32"
						/>
						<stop
							offset="100%"
							stopColor={`var(${accentVar})`}
							stopOpacity="0"
						/>
					</linearGradient>
				</defs>

				<path className={styles.area} d={areaPath} fill="url(#areaChartFill)" />

				<path
					className={styles.line}
					d={linePath}
					fill="none"
					stroke={`var(${accentVar})`}
					strokeWidth="2.5"
					strokeLinejoin="round"
					strokeLinecap="round"
					vectorEffect="non-scaling-stroke"
					pathLength={1}
				/>
			</svg>

			<div className={styles.axis}>
				{data.map((point, index) => (
					<span className={styles.axisLabel} key={`${point.label}-${index}`}>
						{isVisibleLabel(index) ? point.label : ""}
					</span>
				))}
			</div>
		</div>
	);
};

export default AreaChart;
