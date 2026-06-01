"use client";

import { RefObject, useEffect, useRef, useState } from "react";

const useRevealOnScroll = (): {
	isVisible: boolean;
	ref: RefObject<HTMLDivElement | null>;
} => {
	const ref = useRef<HTMLDivElement | null>(null);
	const [isVisible, setIsVisible] = useState<boolean>(false);

	useEffect(() => {
		const element = ref.current;

		if (!element || typeof IntersectionObserver === "undefined") {
			setIsVisible(true);

			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						setIsVisible(true);
						observer.disconnect();
					}
				});
			},
			{ rootMargin: "0px 0px -10% 0px", threshold: 0.12 }
		);

		observer.observe(element);

		return () => observer.disconnect();
	}, []);

	return { isVisible, ref };
};

export default useRevealOnScroll;
