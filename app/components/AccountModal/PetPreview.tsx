"use client";

import { ReactElement } from "react";

/* Lib */
import { PetDesigns, PetSpriteRow } from "@/lib/constants/pets.constants";
import { PetIdleFrame } from "@/lib/constants/snipPet";

/* Components */
import SnipPetPixels from "@/components/SnipPet/SnipPetPixels";
import SnipPetSprite from "@/components/SnipPet/SnipPetSprite";

/* Styles */
import styles from "./accountModal.module.css";

type PetPreviewProps = {
	activeDesign: string;
	onDesignChange: (designId: string) => void;
};

// Design picker for the pet, mirroring the theme and typography grids. Each
// tile shows the design's resting pose: idle row, first frame.
const PetPreview = ({
	activeDesign,
	onDesignChange,
}: PetPreviewProps): ReactElement => {
	return (
		<div className={styles.themeGrid}>
			{PetDesigns.map((design: PetDesign) => (
				<button
					key={design.id}
					type="button"
					title={design.description}
					className={`${styles.themeOption} ${
						activeDesign === design.id ? styles.themeOptionSelected : ""
					}`}
					onClick={() => onDesignChange(design.id)}
				>
					<span className={styles.petPreview}>
						{design.spritesheetUrl ? (
							<SnipPetSprite
								frame={0}
								row={PetSpriteRow.Idle}
								spritesheetUrl={design.spritesheetUrl}
							/>
						) : (
							<span className={styles.petPixelPreview}>
								<SnipPetPixels frame={PetIdleFrame} />
							</span>
						)}
					</span>
					<span className={styles.themeName}>{design.displayName}</span>
				</button>
			))}
		</div>
	);
};

export default PetPreview;
