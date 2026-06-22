"use client";

import { ReactElement, useEffect, useRef, useState } from "react";

type AnimatedCounterProps = {
	decimals?: number;
	durationMs?: number;
	value: number;
};

// Counts up from 0 to `value` with an ease-out curve on mount and whenever the
// value changes. Honours prefers-reduced-motion by snapping to the final value.
const AnimatedCounter = ({
	decimals = 0,
	durationMs = 900,
	value,
}: AnimatedCounterProps): ReactElement => {
	const [display, setDisplay] = useState<number>(value);
	const frameRef = useRef<number>(0);

	useEffect(() => {
		const prefersReduced = window.matchMedia(
			"(prefers-reduced-motion: reduce)"
		).matches;

		if (prefersReduced) {
			setDisplay(value);

			return;
		}

		const start = performance.now();

		const tick = (now: number): void => {
			const progress = Math.min((now - start) / durationMs, 1);
			const eased = 1 - Math.pow(1 - progress, 3);

			setDisplay(value * eased);

			if (progress < 1) {
				frameRef.current = requestAnimationFrame(tick);
			}
		};

		frameRef.current = requestAnimationFrame(tick);

		return () => cancelAnimationFrame(frameRef.current);
	}, [value, durationMs]);

	return (
		<>
			{display.toLocaleString("en-US", {
				maximumFractionDigits: decimals,
				minimumFractionDigits: decimals,
			})}
		</>
	);
};

export default AnimatedCounter;
