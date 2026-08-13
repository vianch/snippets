/* Constants */
import {
	DefaultPetDesignId,
	PetDesigns,
	PetSpriteFrameIntervalMs,
	PetSpriteRow,
	PetSpriteRowFrameIntervalsMs,
} from "@/lib/constants/pets.constants";
import { PetModes } from "@/lib/constants/snipPet";

/* Types */
import type { PetMode } from "@/lib/constants/snipPet";

/* Inclusive on both ends. */
export const randomIntBetween = (minimum: number, maximum: number): number =>
	minimum + Math.floor(Math.random() * (maximum - minimum + 1));

export const pickRandomPhrase = (phrases: readonly string[]): string | null =>
	phrases[Math.floor(Math.random() * phrases.length)] ?? null;

export const findPetDesign = (designId: string | null): PetDesign =>
	PetDesigns.find((design: PetDesign): boolean => design.id === designId) ??
	// The catalogue always contains the default, but the compiler can't know it.
	(PetDesigns.find(
		(design: PetDesign): boolean => design.id === DefaultPetDesignId
	) as PetDesign);

export const isValidPetDesign = (designId: string | null): boolean =>
	PetDesigns.some((design: PetDesign): boolean => design.id === designId);

/*
 * Mode to spritesheet row. Modes with no dedicated row borrow the closest one
 * in spirit: a splat landing and a woozy shake both read as "something went
 * wrong".
 *
 * Walking deliberately ignores PetSpriteRow.RunLeft and mirrors RunRight in CSS
 * instead. The format says row 3 is the pet running left, but the shipped
 * sheets don't agree: some are a true mirror of row 2, several are a verbatim
 * copy of it, and a copy leaves the pet moonwalking on the return trip. Where
 * row 3 *is* the mirror, scaleX(-1) on row 2 draws exactly the same pixels — so
 * flipping is right for every sheet and depends on none of them.
 */
export const spriteRowForMode = (mode: PetMode): PetSpriteRow => {
	if (mode === PetModes.Walking) {
		return PetSpriteRow.RunRight;
	}

	if (mode === PetModes.Celebrating) {
		return PetSpriteRow.Wave;
	}

	if (mode === PetModes.Excited) {
		return PetSpriteRow.Jump;
	}

	if (
		mode === PetModes.Afraid ||
		mode === PetModes.Dizzy ||
		mode === PetModes.Falling ||
		mode === PetModes.Landing
	) {
		return PetSpriteRow.Failure;
	}

	if (mode === PetModes.Grabbed) {
		return PetSpriteRow.Waiting;
	}

	if (mode === PetModes.Working) {
		return PetSpriteRow.ActiveWork;
	}

	if (mode === PetModes.Reviewing) {
		return PetSpriteRow.Review;
	}

	return PetSpriteRow.Idle;
};

export const spriteFrameCountForRow = (
	design: PetDesign,
	row: PetSpriteRow
): number => design.rowFrames[row] ?? 1;

export const spriteFrameIntervalForRow = (row: PetSpriteRow): number =>
	PetSpriteRowFrameIntervalsMs[row] ?? PetSpriteFrameIntervalMs;
