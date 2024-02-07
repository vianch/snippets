import { ReactElement } from "react";

/* Components */
import MagnifyingGlass from "@/components/ui/icons/magnifyingGlass";

/* Styles */
import styles from "./search.module.css";

const Search = (): ReactElement => {
	return (
		<div className={styles.inputContainer}>
			<span className={styles.iconContainer}>
				<MagnifyingGlass className={styles.searchIcon} height="18" width="18" />
			</span>

			<input
				className={styles.searchInput}
				type="text"
				placeholder="Search..."
				maxLength={50}
			/>
		</div>
	);
};

export default Search;
