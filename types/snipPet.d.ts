import { PetMode } from "@/lib/constants/snipPet";

declare global {
	interface PetCell {
		x: number;
		y: number;
	}

	type PetFrame = string[];

	// One entry in the pet catalogue. `id` comes from each folder's pet.json, so
	// it is free-form text rather than a closed enum. `spritesheetUrl` is null
	// for the hand-drawn pixel pet, which renders as SVG instead of a sheet.
	type PetDesign = {
		description: string;
		displayName: string;
		id: string;
		rowFrames: readonly number[];
		spritesheetUrl: string | null;
	};

	// How the pet responds to one emitted event: the mood it switches to and
	// the pool of lines it picks a bubble from.
	type PetReaction = {
		mode: PetMode;
		phrases: readonly string[];
	};

	// A resolved thing for the pet to say. The phrase (or the redirected toast
	// text) is picked at emit time so the pet only has to render it. The nonce
	// is what makes repeats visible: emitting the same event twice still
	// produces a new object the pet reacts to.
	type PetSignal = {
		durationMs: number;
		message: string;
		mode: PetMode;
		nonce: number;
	};
}

export {};
