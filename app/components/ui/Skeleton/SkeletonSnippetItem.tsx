import { ReactElement } from "react";

/* Components */
import Skeleton from "./Skeleton";

/* Styles */
import styles from "./skeleton.module.css";

const SkeletonSnippetItem = (): ReactElement => {
	return (
		<div className={styles.snippetItem}>
			<div className={styles.snippetItemLeft}>
				<Skeleton width="70%" height="0.75rem" />
			</div>
			<Skeleton width="3.5rem" height="0.625rem" />
		</div>
	);
};

export default SkeletonSnippetItem;
