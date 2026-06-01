import type { CSSProperties } from "react";

import { buildStarField } from "@/utils/stars.utils";

const StarColor = "var(--foreground-color)";
const StarFieldHeight = 2000;
const StarFieldWidth = 2560;
const SmallStarCount = 480;
const MediumStarCount = 170;
const BigStarCount = 80;

const smallStarShadow = buildStarField(
	SmallStarCount,
	StarFieldWidth,
	StarFieldHeight,
	StarColor
);
const mediumStarShadow = buildStarField(
	MediumStarCount,
	StarFieldWidth,
	StarFieldHeight,
	StarColor
);
const bigStarShadow = buildStarField(
	BigStarCount,
	StarFieldWidth,
	StarFieldHeight,
	StarColor
);

export const starfieldStyle = {
	// CSS custom properties consumed by starfield.module.css; cast required because these custom properties aren't part of the typed CSSProperties surface
	"--stars-big": bigStarShadow,
	"--stars-medium": mediumStarShadow,
	"--stars-small": smallStarShadow,
} as CSSProperties;
