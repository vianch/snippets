import { ReactElement } from "react";

import styles from "./sectionHeading.module.css";

type SectionHeadingProps = {
	subtitle: string;
	title: string;
};

const SectionHeading = ({
	subtitle,
	title,
}: SectionHeadingProps): ReactElement => {
	return (
		<div className={styles.heading}>
			<h2 className={styles.title}>{title}</h2>

			<p className={styles.subtitle}>{subtitle}</p>
		</div>
	);
};

export default SectionHeading;
