import { ReactElement } from "react";

import styles from "./footer.module.css";

const Footer = (): ReactElement => {
	return (
		<footer className={`container ${styles.copyRight}`}>
			&copy; 2024 snippets.vianch.com
		</footer>
	);
};

export default Footer;
