import { ReactElement } from "react";

import styles from "./footer.module.css";

const Footer = (): ReactElement => {
	return (
		<footer className={styles.copyRight}>
			&copy; 2024 - 2026 snippets.vianch.com
		</footer>
	);
};

export default Footer;
