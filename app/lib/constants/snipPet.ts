/* Pixel marker used by frameToCells to decide which grid cells are solid. */
export const FilledPixel = "#";

/* Sprite grid dimensions (columns x rows) shared by every frame. */
export const PetGridWidth = 12;
export const PetGridHeight = 12;

/* Rendered size of a single sprite pixel, in CSS pixels. */
export const PetPixelSizePx = 5;

/*
 * Motion tuning.
 *
 * Walk speed is paired with the sprite run cycle: the run row is 8 frames at
 * PetSpriteFrameIntervalMs (800ms), so at this speed the pet covers ~62px per
 * cycle — roughly a stride per step instead of skating along the floor. Retune
 * the two together, or the feet start sliding again.
 *
 * ponytail: eyeballed against the shipped sheets, not measured per design.
 */
export const PetWalkSpeedPxPerSecond = 78;
export const PetLegFrameIntervalMs = 120;
export const PetEdgePaddingPx = 18;
export const PetGroundOffsetPx = 10;

/*
 * The pet stands still while the app is being used. It only wanders off once
 * the page has gone this long without a pointer, key, wheel or scroll event —
 * re-rolled every time so it doesn't set off like a metronome — and it stops
 * again the moment the user touches anything.
 */
export const PetMinIdleBeforeWalkMs = 10000;
export const PetMaxIdleBeforeWalkMs = 30000;

/*
 * The one walk that isn't triggered by boredom: on arrival the pet strolls in
 * from its corner so the user actually notices it, then settles and falls into
 * the normal stand-still-until-idle cycle. Any interaction cuts it short.
 */
export const PetIntroWalkMs = 5000;

/*
 * What counts as "the app is being used". Listened for on document in the
 * capture phase, because scroll doesn't bubble.
 */
export const PetActivityEvents = [
	"keydown",
	"pointerdown",
	"pointermove",
	"scroll",
	"wheel",
] as const;

/* How long a click reaction (celebrating / excited) plays before walking again. */
export const PetReactionDurationMs = 1400;

/* Lifted higher than this off the floor while held, the pet panics and shakes. */
export const PetAfraidLiftThresholdPx = 48;

/* Drop physics: released above this height, the pet free-falls and splats. */
export const PetDropMinHeightPx = 16;
export const PetGravityPxPerSecondSquared = 2600;
export const PetMaxImpactSpeedPxPerSecond = 1200;
export const PetLandingDurationMs = 440;

/* Impact ratio (0-1) above which the landing pops a cartoon "Thump!" bubble. */
export const PetHardImpactRatio = 0.45;

/*
 * Shake detection while held: each rapid horizontal direction reversal (of at
 * least PetShakeMinDeltaPx) adds energy, which bleeds off at PetShakeDecayPerSecond.
 * Crossing the trigger makes the pet dizzy; it stays dizzy until energy falls
 * below the (lower) release threshold — hysteresis so it doesn't flicker.
 */
export const PetShakeMinDeltaPx = 5;
export const PetShakeTriggerEnergy = 3;
export const PetShakeReleaseEnergy = 1;
export const PetShakeMaxEnergy = 6;
export const PetShakeDecayPerSecond = 4;

/* A pointer-up within this travel distance counts as a click, not a drag. */
export const PetClickMovementThresholdPx = 6;

/* The pet only appears on wide viewports driven by a fine pointer (a mouse). */
export const PetDesktopMinWidthPx = 1024;

export const PetModes = {
	Afraid: "afraid",
	Celebrating: "celebrating",
	Dizzy: "dizzy",
	Excited: "excited",
	Falling: "falling",
	Grabbed: "grabbed",
	Idle: "idle",
	Landing: "landing",
	Reviewing: "reviewing",
	Walking: "walking",
	Working: "working",
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

const PetBodyDizzy: PetFrame = [
	"..########..",
	".##########.",
	"############",
	"############",
	"###..##..###",
	"############",
	"############",
	"###..##..###",
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

/* Woozy face while being shaken; legs dangle since it is held. */
export const PetDizzyFrame: PetFrame = [...PetBodyDizzy, ...PetDangleLegs];

/* Just landed: the worried face but feet planted, ready for the squash. */
export const PetDazedFrame: PetFrame = [...PetBodyAfraid, ...PetIdleLegs];

/* Head-down concentration while a background task (an AI request) runs. */
const PetBodyWorking: PetFrame = [
	"..########..",
	".##########.",
	"############",
	"############",
	"############",
	"###.####.###",
	"############",
	"####....####",
	"############",
	".##########.",
];

export const PetWorkingFrame: PetFrame = [...PetBodyWorking, ...PetIdleLegs];

/* Squinting at something: used for inspect/review style reactions. */
const PetBodyReviewing: PetFrame = [
	"..########..",
	".##########.",
	"############",
	"############",
	"###..#...###",
	"###..####.##",
	"############",
	"#####..#####",
	"############",
	".##########.",
];

export const PetReviewingFrame: PetFrame = [
	...PetBodyReviewing,
	...PetIdleLegs,
];

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

export const PetLandingMessages = ["Thump!", "Oof!", "Ow!", "Splat!"] as const;

export const PetDizzyMessages = [
	"Whoa!",
	"Stop it!",
	"@_@",
	"So dizzy!",
	"Wheee!",
] as const;
