"use client";

import { ReactElement, useMemo } from "react";

/* Constants */
import { PetGridHeight, PetGridWidth } from "@/lib/constants/snipPet";

/* Utils */
import { frameToCells } from "@/utils/snipPet.utils";

/* Styles */
import styles from "./snipPet.module.css";

type SnipPetPixelsProps = {
	frame: PetFrame;
};

// The original hand-drawn pet: a 12x12 pixel grid rendered as SVG rects, so the
// eyes and mouth are holes the page background shows through.
const SnipPetPixels = ({ frame }: SnipPetPixelsProps): ReactElement => {
	const cells = useMemo<PetCell[]>(() => frameToCells(frame), [frame]);

	return (
		<svg
			className={styles.sprite}
			viewBox={`0 0 ${PetGridWidth} ${PetGridHeight}`}
		>
			{cells.map((cell) => (
				<rect
					height={1}
					key={`${cell.x}-${cell.y}`}
					width={1}
					x={cell.x}
					y={cell.y}
				/>
			))}
		</svg>
	);
};

export default SnipPetPixels;
