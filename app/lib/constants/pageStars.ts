import { buildFloatingStars } from "@/utils/stars.utils";

const PageStarCount = 64;
const PageStarMaxDelaySeconds = 18;

export const pageStars = buildFloatingStars(
	PageStarCount,
	PageStarMaxDelaySeconds
);
