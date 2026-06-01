/* Pixel marker used by frameToCells to decide which grid cells are solid. */
export const FilledPixel = "#";

/* Sprite grid dimensions (columns x rows) shared by every frame. */
export const PetGridWidth = 12;
export const PetGridHeight = 12;

/* Rendered size of a single sprite pixel, in CSS pixels. */
export const PetPixelSizePx = 5;

/* Motion tuning. */
export const PetWalkSpeedPxPerSecond = 44;
export const PetLegFrameIntervalMs = 160;
export const PetEdgePaddingPx = 18;
export const PetGroundOffsetPx = 10;
export const PetIdlePauseMs = 1600;
export const PetMinWalkBeforeIdleMs = 2600;
export const PetMaxWalkBeforeIdleMs = 6000;

/* How long a click reaction (celebrating / excited) plays before walking again. */
export const PetReactionDurationMs = 1400;

/* Lifted higher than this off the floor while held, the pet panics and shakes. */
export const PetAfraidLiftThresholdPx = 48;

/* A pointer-up within this travel distance counts as a click, not a drag. */
export const PetClickMovementThresholdPx = 6;

/* The pet only appears on wide viewports driven by a fine pointer (a mouse). */
export const PetDesktopMinWidthPx = 1024;

export const PetModes = {
	Afraid: "afraid",
	Celebrating: "celebrating",
	Excited: "excited",
	Grabbed: "grabbed",
	Idle: "idle",
	Walking: "walking",
} as const;

export type PetMode = (typeof PetModes)[keyof typeof PetModes];

export const PetFacings = {
	Left: -1,
	Right: 1,
} as const;

export type PetFacing = (typeof PetFacings)[keyof typeof PetFacings];

/*
 * Each body is the top 10 rows of the sprite; the two leg rows are appended per
 * frame. Rows 0-3 (dome) and 8-9 (base) stay constant — only rows 4-7 (the face)
 * change to express an emotion. Eyes and mouths are empty cells, so the page
 * background shows through them.
 */
const PetBodyNormal: PetFrame = [
	"..########..",
	".##########.",
	"############",
	"############",
	"###..##..###",
	"###..##..###",
	"############",
	"############",
	"############",
	".##########.",
];

const PetBodyHappy: PetFrame = [
	"..########..",
	".##########.",
	"############",
	"############",
	"###..##..###",
	"############",
	"############",
	"###......###",
	"############",
	".##########.",
];

const PetBodyExcited: PetFrame = [
	"..########..",
	".##########.",
	"############",
	"############",
	"###..##..###",
	"###..##..###",
	"############",
	"####....####",
	"############",
	".##########.",
];

const PetBodyAfraid: PetFrame = [
	"..########..",
	".##########.",
	"############",
	"############",
	"###..##..###",
	"###..##..###",
	"############",
	"#####..#####",
	"############",
	".##########.",
];

/* Leg rows: walking alternates these two, idle plants both, dangle splays them. */
const PetIdleLegs = ["..##....##..", "............"];
const PetDangleLegs = [".##......##.", ".#........#."];

export const PetWalkFrames: PetFrame[] = [
	[...PetBodyNormal, "..##....##..", "..##........"],
	[...PetBodyNormal, "..##....##..", "........##.."],
];

export const PetIdleFrame: PetFrame = [...PetBodyNormal, ...PetIdleLegs];

export const PetGrabbedFrame: PetFrame = [...PetBodyNormal, ...PetDangleLegs];

export const PetHappyFrame: PetFrame = [...PetBodyHappy, ...PetIdleLegs];

export const PetExcitedFrame: PetFrame = [...PetBodyExcited, ...PetIdleLegs];

export const PetAfraidFrame: PetFrame = [...PetBodyAfraid, ...PetDangleLegs];

export const PetMessages = [
	"Hi there!",
	"I'm SnipPet!",
	"Keep snipping!",
	"Need a snippet?",
	"Boop!",
	"Let's code.",
	"Save it for later!",
	"Woohoo!",
] as const;

export const PetScaredMessages = [
	"Eeek!",
	"Put me down!",
	"Too high!",
	"Wobble...",
] as const;
