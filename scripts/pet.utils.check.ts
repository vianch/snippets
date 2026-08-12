// Runnable self-check for app/utils/pet.utils.ts (there is no test runner in
// this repo). Run with: npx tsx scripts/pet.utils.check.ts
//
// Lives under scripts/ for the same reason as table.utils.check.ts: assert
// calls and stdout writes are not pure, so it would violate the "utils are
// pure functions only" convention if it sat in app/utils/.
import assert from "node:assert/strict";

import {
	ClassicPetDesignId,
	DefaultPetDesignId,
	PetDefaultRowFrames,
	PetDesigns,
	PetSpriteColumns,
	PetSpriteRow,
	PetSpriteRows,
} from "../app/lib/constants/pets.constants";
import { GeneratedPetDesigns } from "../app/lib/constants/pets.generated";
import {
	PetReactions,
	PetToastModes,
} from "../app/lib/constants/petReactions.constants";
import { PetFacings, PetModes } from "../app/lib/constants/snipPet";
import { ToastType } from "../app/lib/constants/toast";
import {
	findPetDesign,
	isValidPetDesign,
	pickRandomPhrase,
	randomIntBetween,
	spriteFrameCountForRow,
	spriteRowForMode,
} from "../app/utils/pet.utils";

const results: string[] = [];

const check = (description: string, run: () => void): void => {
	run();
	results.push(`ok - ${description}`);
};

check("every design declares one frame count per sheet row", () => {
	PetDesigns.forEach((design) => {
		assert.equal(design.rowFrames.length, PetSpriteRows);

		design.rowFrames.forEach((frames) => {
			assert.ok(frames >= 1 && frames <= PetSpriteColumns);
		});
	});
});

check("design ids are unique and the default one exists", () => {
	const ids = PetDesigns.map((design) => design.id);

	assert.equal(new Set(ids).size, ids.length);
	assert.ok(ids.includes(DefaultPetDesignId));
});

check("only the classic design renders without a spritesheet", () => {
	PetDesigns.forEach((design) => {
		assert.equal(
			design.spritesheetUrl === null,
			design.id === ClassicPetDesignId
		);
	});
});

check("every pet folder discovered by pets:sync is in the catalogue", () => {
	// Guards the generated half: a stale pets.generated.ts (someone added a
	// folder and never ran the build) shows up as an empty or short list.
	assert.ok(GeneratedPetDesigns.length > 0);

	GeneratedPetDesigns.forEach((generated) => {
		assert.equal(isValidPetDesign(generated.id), true);
		assert.ok(generated.spritesheetUrl?.endsWith(".webp"));
		assert.ok(generated.displayName.length > 0);
	});
});

check("an unknown or missing design id falls back to the default", () => {
	const spritePet = GeneratedPetDesigns[0];

	assert.equal(findPetDesign("not-a-pet").id, DefaultPetDesignId);
	assert.equal(findPetDesign(null).id, DefaultPetDesignId);
	assert.equal(findPetDesign(spritePet.id).id, spritePet.id);
	assert.equal(isValidPetDesign("not-a-pet"), false);
	assert.equal(isValidPetDesign(spritePet.id), true);
});

check("walking always uses the run-right row, never run-left", () => {
	// Direction comes from mirroring in CSS, because several shipped sheets copy
	// row 2 into row 3 instead of mirroring it — picking row 3 there would leave
	// the pet facing right while travelling left.
	assert.equal(spriteRowForMode(PetModes.Walking), PetSpriteRow.RunRight);
	assert.notEqual(spriteRowForMode(PetModes.Walking), PetSpriteRow.RunLeft);
	assert.equal(PetFacings.Left, -1);
	assert.equal(PetFacings.Right, 1);
});

check("every mode maps to a row that exists in the sheet", () => {
	Object.values(PetModes).forEach((mode) => {
		const row = spriteRowForMode(mode);

		assert.ok(row >= 0 && row < PetSpriteRows);
	});
});

check("modes without a dedicated row borrow a sensible one", () => {
	assert.equal(spriteRowForMode(PetModes.Landing), PetSpriteRow.Failure);
	assert.equal(spriteRowForMode(PetModes.Dizzy), PetSpriteRow.Failure);
	assert.equal(spriteRowForMode(PetModes.Idle), PetSpriteRow.Idle);
});

check("frame counts never index past a row's drawn frames", () => {
	const classic = findPetDesign(DefaultPetDesignId);

	assert.equal(
		spriteFrameCountForRow(classic, PetSpriteRow.Wave),
		PetDefaultRowFrames[PetSpriteRow.Wave]
	);

	// The animation loop takes `counter % count`, so a count of 0 would divide
	// into NaN and blank the sprite.
	PetDesigns.forEach((design) => {
		Array.from({ length: PetSpriteRows }).forEach((_unused, row) => {
			assert.ok(spriteFrameCountForRow(design, row) >= 1);
		});
	});
});

check("every toast severity has a mood to be spoken in", () => {
	// The pet swallows the toast strip while it is on screen, so a severity with
	// no mood would render an undefined sprite row instead of the message.
	// ToastType is a const enum with no runtime object, so the map's own keys
	// are what there is to walk — TS guarantees they cover the union.
	const toastModes = Object.values(PetToastModes);

	assert.equal(toastModes.length, 5);
	assert.ok(PetToastModes[ToastType.Error] === PetModes.Afraid);
	toastModes.forEach((mode) => {
		assert.ok(Object.values(PetModes).includes(mode));
	});
});

check("every event has a reaction with at least one line", () => {
	Object.values(PetReactions).forEach((reaction) => {
		assert.ok(reaction.phrases.length > 0);
		assert.ok(Object.values(PetModes).includes(reaction.mode));
		assert.equal(pickRandomPhrase(reaction.phrases) === null, false);
	});
});

check("the idle pool holds the promised 100 lines, no duplicates", () => {
	const idlePhrases = PetReactions["idle-chatter"].phrases;

	assert.equal(idlePhrases.length, 100);
	assert.equal(new Set(idlePhrases).size, 100);
});

check("randomIntBetween stays inside its inclusive bounds", () => {
	Array.from({ length: 500 }).forEach(() => {
		const value = randomIntBetween(3, 7);

		assert.ok(value >= 3 && value <= 7);
		assert.equal(Number.isInteger(value), true);
	});

	assert.equal(randomIntBetween(4, 4), 4);
});

check("an empty phrase pool yields null instead of undefined", () => {
	assert.equal(pickRandomPhrase([]), null);
});

process.stdout.write(`${results.join("\n")}\n`);
process.stdout.write(`\n${results.length} checks passed.\n`);
