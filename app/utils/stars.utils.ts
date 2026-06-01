const hashToUnitInterval = (input: number): number => {
	const mixedOnce = Math.imul(input ^ (input >>> 15), 0x2c1b3c6d);
	const mixedTwice = Math.imul(mixedOnce ^ (mixedOnce >>> 12), 0x297a2d39);
	const normalized = (mixedTwice ^ (mixedTwice >>> 15)) >>> 0;

	return normalized / 0xffffffff;
};

export const buildStarField = (
	starCount: number,
	spreadX: number,
	spreadY: number,
	color: string
): string =>
	Array.from({ length: starCount }, (_, index) => {
		const offsetX = Math.floor(hashToUnitInterval(index * 2 + 1) * spreadX);
		const offsetY = Math.floor(hashToUnitInterval(index * 2 + 2) * spreadY);

		return `${offsetX}px ${offsetY}px ${color}`;
	}).join(", ");

export const buildFloatingStars = (
	starCount: number,
	maxDelaySeconds: number
): PageStar[] =>
	Array.from({ length: starCount }, (_, index) => {
		const left = Math.round(hashToUnitInterval(index * 4 + 1) * 10000) / 100;
		const top = Math.round(hashToUnitInterval(index * 4 + 2) * 10000) / 100;
		const size = 2 + Math.round(hashToUnitInterval(index * 4 + 3) * 2);
		const delay =
			-Math.round(hashToUnitInterval(index * 4 + 4) * maxDelaySeconds * 10) /
			10;

		return { delay, left, size, top };
	});
