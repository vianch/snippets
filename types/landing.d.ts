import { ReactElement } from "react";

declare global {
	type LandingAccent =
		| "blue"
		| "cyan"
		| "green"
		| "orange"
		| "purple"
		| "red"
		| "yellow";

	type LandingFeatureSize = "large" | "medium" | "small";

	type LandingTokenKind =
		| "comment"
		| "function"
		| "keyword"
		| "plain"
		| "string";

	interface LandingCodeToken {
		kind: LandingTokenKind;
		text: string;
	}

	interface LandingFeature {
		accent: LandingAccent;
		description: string;
		detail: string;
		icon: (iconProps: Icon) => ReactElement;
		image?: string;
		size: LandingFeatureSize;
		title: string;
	}

	interface LandingStat {
		label: string;
		suffix: string;
		value: number;
	}

	interface PageStar {
		delay: number;
		left: number;
		size: number;
		top: number;
	}
}
