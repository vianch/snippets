"use client";

import { CSSProperties, ReactElement } from "react";

/* Constants */
import {
	PetSpriteFrameHeightPx,
	PetSpriteFrameWidthPx,
	PetSpriteSheetHeightPx,
	PetSpriteSheetWidthPx,
} from "@/lib/constants/pets.constants";

/* Styles */
import styles from "./snipPet.module.css";

type SnipPetSpriteProps = {
	frame?: number;
	row?: number;
	spritesheetUrl: string;
};

// A single cell of an 8x9 spritesheet. Which cell is chosen by the --pet-row /
// --pet-frame custom properties: the walking pet's animation loop writes them
// on the container every frame (no React re-render), while static consumers
// like the settings preview pass explicit `row` / `frame` props instead.
const SnipPetSprite = ({
	frame,
	row,
	spritesheetUrl,
}: SnipPetSpriteProps): ReactElement => {
	const style = {
		"--pet-sprite-frame-height": `${PetSpriteFrameHeightPx}px`,
		"--pet-sprite-frame-width": `${PetSpriteFrameWidthPx}px`,
		backgroundImage: `url(${spritesheetUrl})`,
		backgroundSize: `${PetSpriteSheetWidthPx}px ${PetSpriteSheetHeightPx}px`,
		...(frame === undefined ? {} : { "--pet-frame": frame }),
		...(row === undefined ? {} : { "--pet-row": row }),
		// Custom properties are valid inline styles but absent from CSSProperties.
	} as CSSProperties;

	return <span aria-hidden="true" className={styles.sheet} style={style} />;
};

export default SnipPetSprite;
