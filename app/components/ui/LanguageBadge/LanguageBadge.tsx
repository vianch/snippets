import { ReactElement } from "react";

/* Utils */
import { getLanguageAbbreviation } from "@/utils/language.utils";

/* Styles */
import styles from "./languageBadge.module.css";

type LanguageBadgeProps = {
	language: string;
};

const LanguageBadge = ({ language }: LanguageBadgeProps): ReactElement => {
	const abbreviation = getLanguageAbbreviation(language);

	return <span className={styles.badge}>{abbreviation}</span>;
};

export default LanguageBadge;
