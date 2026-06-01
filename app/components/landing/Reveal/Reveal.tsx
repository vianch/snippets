"use client";

import { ReactElement, ReactNode } from "react";

import useRevealOnScroll from "@/components/landing/hooks/useRevealOnScroll";

import styles from "./reveal.module.css";

type RevealProps = {
	children: ReactNode;
	className?: string;
	delay?: number;
};

const Reveal = ({
	children,
	className = "",
	delay = 0,
}: RevealProps): ReactElement => {
	const { isVisible, ref } = useRevealOnScroll();

	return (
		<div
			ref={ref}
			className={`${styles.reveal} ${className}`}
			data-revealed={isVisible}
			style={delay ? { transitionDelay: `${delay}ms` } : undefined}
		>
			{children}
		</div>
	);
};

export default Reveal;
