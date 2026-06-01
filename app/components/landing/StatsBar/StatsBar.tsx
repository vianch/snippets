"use client";

import { ReactElement, useEffect, useRef, useState } from "react";

import { statItems } from "@/lib/constants/landing";
import useRevealOnScroll from "@/components/landing/hooks/useRevealOnScroll";

import styles from "./statsBar.module.css";

const countUpDurationMs = 1100;

const StatsBar = (): ReactElement => {
	const { isVisible, ref } = useRevealOnScroll();
	const frameRef = useRef<number>(0);
	const [values, setValues] = useState<number[]>(
		statItems.map((item) => item.value)
	);

	useEffect(() => {
		if (!isVisible) {
			return;
		}

		const prefersReduced = window.matchMedia(
			"(prefers-reduced-motion: reduce)"
		).matches;

		if (prefersReduced) {
			return;
		}

		const targets = statItems.map((item) => item.value);

		const tick = (timestamp: number, start: number): void => {
			const progress = Math.min((timestamp - start) / countUpDurationMs, 1);
			const eased = 1 - Math.pow(1 - progress, 3);

			setValues(targets.map((target) => Math.round(target * eased)));

			if (progress < 1) {
				frameRef.current = requestAnimationFrame((next) => tick(next, start));
			}
		};

		frameRef.current = requestAnimationFrame((timestamp) =>
			tick(timestamp, timestamp)
		);

		return () => cancelAnimationFrame(frameRef.current);
	}, [isVisible]);

	return (
		<section className={styles.section}>
			<div ref={ref} className={`container ${styles.bar}`}>
				{statItems.map((item, index) => (
					<div className={styles.stat} key={item.label}>
						<span className={styles.value}>
							{values[index] ?? item.value}
							{item.suffix}
						</span>

						<span className={styles.label}>{item.label}</span>
					</div>
				))}
			</div>
		</section>
	);
};

export default StatsBar;
