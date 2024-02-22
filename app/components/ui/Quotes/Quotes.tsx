import { ReactElement, ReactNode } from "react";

import styles from "./quotes.module.css";

type QuotesProps = {
	children: ReactNode;
};
const Quotes = ({ children }: QuotesProps): ReactElement => (
	<blockquote className={styles.container}>{children}</blockquote>
);

export default Quotes;
