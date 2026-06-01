import { ReactElement } from "react";

import { starfieldStyle } from "@/lib/constants/starfield";

import styles from "./starfield.module.css";

const Starfield = (): ReactElement => {
	return (
		<div aria-hidden="true" className={styles.starfield} style={starfieldStyle}>
			<div className={`${styles.layer} ${styles.small}`} />

			<div className={`${styles.layer} ${styles.medium}`} />

			<div className={`${styles.layer} ${styles.big}`} />
		</div>
	);
};

export default Starfield;
