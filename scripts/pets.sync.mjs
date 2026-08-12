/*
 * Regenerates app/lib/constants/pets.generated.ts from the pet folders under
 * public/assets/images/pets/. Run it after dropping in a new pet:
 *
 *   yarn pets:sync
 *
 * `yarn build` runs it first via the `prebuild` lifecycle script, so a pet
 * added to the folder is in the settings picker on the next build.
 *
 * Each folder needs a pet.json (id, displayName, description) and a
 * spritesheet.webp laid out as 8 columns x 9 rows of 192x208 cells. The number
 * of frames actually drawn per row is measured here rather than declared,
 * because trailing blank cells are invisible everywhere except the alpha
 * channel — animating through them would stutter the pet out of existence.
 *
 * Plain .mjs on purpose: this runs on every build, so it must work with bare
 * `node` and no TypeScript runner to install.
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PetsDirectory = "public/assets/images/pets";
const OutputPath = "app/lib/constants/pets.generated.ts";
const SpritePublicPath = "/assets/images/pets";

const Columns = 8;
const Rows = 9;
const CellWidth = 192;
const CellHeight = 208;
const SheetWidth = Columns * CellWidth;
const SheetHeight = Rows * CellHeight;

/* Sampling: every other pixel is plenty to tell a drawn cell from a blank one. */
const SampleStride = 2;
const AlphaThreshold = 12;
const MinOpaqueSamples = 200;

/* Used when the sheet can't be measured. Matches every pet shipped so far. */
const FallbackRowFrames = [6, 8, 8, 4, 5, 8, 6, 6, 6];

const warnings = [];

const warn = (message) => {
	warnings.push(message);
};

/*
 * sharp arrives transitively with Next as well as being a direct devDependency,
 * but it is a native module: if the prebuilt binary doesn't match the platform
 * it fails to load. That must not take the build down, so fall back to the
 * known-good frame counts instead of throwing.
 */
const loadSharp = async () => {
	try {
		const sharpModule = await import("sharp");

		return sharpModule.default;
	} catch {
		warn("sharp unavailable — falling back to default frame counts");

		return null;
	}
};

const measureRowFrames = async (sharp, spritesheetPath) => {
	if (!sharp) {
		return FallbackRowFrames;
	}

	const { data, info } = await sharp(spritesheetPath)
		.ensureAlpha()
		.raw()
		.toBuffer({ resolveWithObject: true });

	if (info.width !== SheetWidth || info.height !== SheetHeight) {
		warn(
			`${spritesheetPath}: expected ${SheetWidth}x${SheetHeight}, got ${info.width}x${info.height} — using default frame counts`
		);

		return FallbackRowFrames;
	}

	const rowFrames = [];

	for (let row = 0; row < Rows; row += 1) {
		let lastDrawnColumn = 0;

		for (let column = 0; column < Columns; column += 1) {
			let opaqueSamples = 0;

			for (let y = 0; y < CellHeight; y += SampleStride) {
				const pixelY = row * CellHeight + y;

				for (let x = 0; x < CellWidth; x += SampleStride) {
					const pixelX = column * CellWidth + x;
					const alphaIndex = (pixelY * info.width + pixelX) * info.channels + 3;

					if (data[alphaIndex] > AlphaThreshold) {
						opaqueSamples += 1;
					}
				}
			}

			if (opaqueSamples >= MinOpaqueSamples) {
				lastDrawnColumn = column + 1;
			}
		}

		// Never 0: the animation loop takes `counter % frames`, and a zero would
		// turn into NaN and blank the sprite entirely.
		rowFrames.push(lastDrawnColumn || 1);
	}

	return rowFrames;
};

const readManifest = (folder) => {
	try {
		return JSON.parse(
			readFileSync(join(PetsDirectory, folder, "pet.json"), "utf8")
		);
	} catch {
		warn(`${folder}: no readable pet.json — skipped`);

		return null;
	}
};

const collectDesigns = async () => {
	const sharp = await loadSharp();
	const folders = readdirSync(PetsDirectory, { withFileTypes: true })
		.filter((entry) => entry.isDirectory())
		.map((entry) => entry.name)
		.sort();
	const designs = [];
	const seenIds = new Set();

	for (const folder of folders) {
		const manifest = readManifest(folder);

		if (!manifest?.id || !manifest?.displayName) {
			if (manifest) {
				warn(`${folder}: pet.json needs an id and a displayName — skipped`);
			}

			continue;
		}

		if (seenIds.has(manifest.id)) {
			warn(`${folder}: duplicate pet id "${manifest.id}" — skipped`);

			continue;
		}

		const spritesheetFile = manifest.spritesheetPath ?? "spritesheet.webp";
		const spritesheetPath = join(PetsDirectory, folder, spritesheetFile);

		let rowFrames;

		try {
			rowFrames = await measureRowFrames(sharp, spritesheetPath);
		} catch {
			warn(`${folder}: could not read ${spritesheetFile} — skipped`);

			continue;
		}

		seenIds.add(manifest.id);
		designs.push({
			description: manifest.description ?? "",
			displayName: manifest.displayName,
			id: manifest.id,
			rowFrames,
			spritesheetUrl: `${SpritePublicPath}/${folder}/${spritesheetFile}`,
		});
	}

	return designs;
};

const renderFile = (designs) => {
	const entries = designs
		.map((design) =>
			[
				"\t{",
				`\t\tdescription: ${JSON.stringify(design.description)},`,
				`\t\tdisplayName: ${JSON.stringify(design.displayName)},`,
				`\t\tid: ${JSON.stringify(design.id)},`,
				`\t\trowFrames: [${design.rowFrames.join(", ")}],`,
				`\t\tspritesheetUrl: ${JSON.stringify(design.spritesheetUrl)},`,
				"\t},",
			].join("\n")
		)
		.join("\n");

	return [
		"/*",
		" * GENERATED FILE — do not edit by hand.",
		" *",
		` * Written by scripts/pets.sync.mjs from ${PetsDirectory}/. Add a pet by`,
		" * dropping a folder there (pet.json + spritesheet.webp) and running",
		" * `yarn pets:sync`; `yarn build` regenerates this automatically.",
		" *",
		" * rowFrames is measured from each sheet's alpha channel, indexed by",
		" * PetSpriteRow.",
		" */",
		"",
		"export const GeneratedPetDesigns: readonly PetDesign[] = [",
		entries,
		"];",
		"",
	].join("\n");
};

const designs = await collectDesigns();

writeFileSync(OutputPath, renderFile(designs), "utf8");

warnings.forEach((message) => process.stdout.write(`warning: ${message}\n`));
process.stdout.write(
	`pets:sync wrote ${designs.length} sprite pets to ${OutputPath}\n`
);
