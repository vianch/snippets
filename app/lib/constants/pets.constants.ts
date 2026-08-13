import { GeneratedPetDesigns } from "@/lib/constants/pets.generated";

/*
 * Pet designs and spritesheet geometry.
 *
 * Every sprite pet ships as a transparent 1536x1872 WebP laid out as an 8x9
 * grid of 192x208 cells: one row per behaviour, eight columns of frames. Rows
 * are fixed by the format (see PetSpriteRow); the number of *used* frames in a
 * row varies, so trailing blank cells are trimmed by PetDefaultRowFrames.
 */

/* Source sheet: columns x rows. Cell size (192x208) lives in scripts/pets.sync.mjs. */
export const PetSpriteColumns = 8;
export const PetSpriteRows = 9;

/*
 * Rendered at 3/8 scale so every derived size stays a whole number of CSS
 * pixels — fractional background sizes bleed neighbouring frames into view.
 */
export const PetSpriteFrameWidthPx = 72;
export const PetSpriteFrameHeightPx = 78;
export const PetSpriteSheetWidthPx = PetSpriteFrameWidthPx * PetSpriteColumns;
export const PetSpriteSheetHeightPx = PetSpriteFrameHeightPx * PetSpriteRows;

/* Row index within the sheet. Fixed by the spritesheet format. */
export const enum PetSpriteRow {
	ActiveWork = 7,
	Failure = 5,
	Idle = 0,
	Jump = 4,
	Review = 8,
	RunLeft = 2,
	RunRight = 1,
	Waiting = 6,
	Wave = 3,
}

/*
 * Frames per row for the pixel pet, which has no sheet to measure. Sprite pets
 * carry their own measured counts (see pets.generated.ts).
 */
export const PetDefaultRowFrames = [6, 8, 8, 4, 5, 8, 6, 6, 6] as const;

export const ClassicPetDesignId = "classic";

export const DefaultPetDesignId = ClassicPetDesignId;

/*
 * The hand-drawn pixel pet. It has no spritesheet — SnipPetPixels renders it as
 * SVG — so it is the one design that isn't discovered from the pets folder.
 */
const ClassicPetDesign: PetDesign = {
	description: "The original hand-drawn pixel companion.",
	displayName: "SnipPet",
	id: ClassicPetDesignId,
	rowFrames: PetDefaultRowFrames,
	spritesheetUrl: null,
};

/*
 * The pet catalogue: the classic pixel pet plus every folder under
 * public/assets/images/pets/. The sprite half is generated — see
 * scripts/pets.sync.mjs — so adding a pet is a folder, not a code change.
 */
export const PetDesigns: readonly PetDesign[] = [
	ClassicPetDesign,
	...GeneratedPetDesigns,
];

/*
 * Everything the pet can react to. Emitted through the pet store from wherever
 * the action happens; the pet maps each one to a mood and a line of dialogue
 * (see petReactions.constants.ts).
 */
export const enum PetEvent {
	AiCompleted = "ai-completed",
	AiFailed = "ai-failed",
	AiStarted = "ai-started",
	CodeCopied = "code-copied",
	FavoriteAdded = "favorite-added",
	FavoriteRemoved = "favorite-removed",
	FolderChanged = "folder-changed",
	FontChanged = "font-changed",
	IdleChatter = "idle-chatter",
	LanguageChanged = "language-changed",
	SmartGroupSaved = "smart-group-saved",
	SnippetCreated = "snippet-created",
	SnippetImported = "snippet-imported",
	SnippetPublished = "snippet-published",
	SnippetRestored = "snippet-restored",
	SnippetSaveFailed = "snippet-save-failed",
	SnippetSaved = "snippet-saved",
	SnippetShared = "snippet-shared",
	SnippetTrashed = "snippet-trashed",
	SnippetUnpublished = "snippet-unpublished",
	TagAdded = "tag-added",
	TagRemoved = "tag-removed",
	ThemeChanged = "theme-changed",
	TrashEmptied = "trash-emptied",
	UnsavedExit = "unsaved-exit",
	VersionRestored = "version-restored",
}

/* How long an event bubble and its mood stay on screen. */
export const PetEventBubbleDurationMs = 3400;

/*
 * A redirected toast is real copy — an error, a name, a link — rather than a
 * one-liner, so it lingers past the toast strip's own 3.2s timeout.
 */
export const PetMessageDurationMs = 6000;

/*
 * "Thinking" outlives a normal reaction because it is meant to cover a whole AI
 * request. AiCompleted / AiFailed cut it short when the answer lands.
 */
export const PetWorkingDurationMs = 25000;

/* Unprompted chatter fires somewhere in this window, then re-rolls. */
export const PetIdleChatterMinMs = 30000;
export const PetIdleChatterMaxMs = 300000;

/*
 * Fallback sprite playback rate, in milliseconds per frame, for any row without
 * an entry in PetSpriteRowFrameIntervalsMs.
 */
export const PetSpriteFrameIntervalMs = 200;

/*
 * Milliseconds per frame, indexed by PetSpriteRow — same layout as
 * PetDefaultRowFrames.
 *
 * Only the run rows are tied to PetWalkSpeedPxPerSecond: the feet have to keep
 * up with the ground, so those two and the walk speed get retuned together.
 * Every other row is a loop in place, and playing those at run pace is what
 * made the pets twitch — an idle blink especially has to hold still between
 * frames or it reads as a stutter rather than a blink.
 */
export const PetSpriteRowFrameIntervalsMs = [
	110, // Idle — the blink itself is quick; see PetIdleHoldMinMs for the pause
	100, // RunRight — paired with PetWalkSpeedPxPerSecond
	100, // RunLeft — unused, mirrored from RunRight (see spriteRowForMode)
	190, // Wave
	170, // Jump
	180, // Failure
	280, // Waiting — held pose, barely moves
	220, // ActiveWork
	240, // Review
] as const;

/*
 * The idle row is a single blink, not a loop of blinking. Frame 0 is the pet
 * with its eyes open, so it is held for this long — re-rolled each time, or
 * every pet on screen blinks in unison — and only then does the blink play out
 * at the row's normal interval.
 */
export const PetIdleHoldMinMs = 2600;
export const PetIdleHoldMaxMs = 6500;

/*
 * Pointer exits through the top edge of the viewport (clientY <= this) read as
 * "heading for the tab bar / close button" — the moment to nag about unsaved
 * work, since beforeunload cannot render a bubble.
 */
export const PetExitPointerThresholdPx = 0;
export const PetExitNagCooldownMs = 20000;
