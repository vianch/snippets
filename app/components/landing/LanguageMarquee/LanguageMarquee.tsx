import { ReactElement } from "react";

import { LanguagesLabel, languageDisplayNames } from "@/lib/constants/landing";

import styles from "./languageMarquee.module.css";

const marqueeNames = [...languageDisplayNames, ...languageDisplayNames];

const LanguageMarquee = (): ReactElement => {
	return (
		<section className={styles.section} aria-label={LanguagesLabel}>
			<p className={styles.label}>{LanguagesLabel}</p>

			<div className={styles.marquee}>
				<div className={styles.track}>
					{marqueeNames.map((name, index) => (
						<span className={styles.badge} key={`${name}-${index}`}>
							{name}
						</span>
					))}
				</div>
			</div>
		</section>
	);
};

export default LanguageMarquee;
