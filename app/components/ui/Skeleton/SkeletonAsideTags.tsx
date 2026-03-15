import { ReactElement } from "react";

/* Components */
import Skeleton from "./Skeleton";

/* Styles */
import styles from "./skeleton.module.css";

const SkeletonAsideTags = (): ReactElement => {
	return (
		<div className={styles.asideTagsContainer}>
			<div className={styles.asideTagItem}>
				<Skeleton width="0.75rem" height="0.75rem" borderRadius="2px" />
				<Skeleton width="4.5rem" height="0.75rem" />
			</div>
			<div className={styles.asideTagItem}>
				<Skeleton width="0.75rem" height="0.75rem" borderRadius="2px" />
				<Skeleton width="6rem" height="0.75rem" />
			</div>
			<div className={styles.asideTagItem}>
				<Skeleton width="0.75rem" height="0.75rem" borderRadius="2px" />
				<Skeleton width="3.5rem" height="0.75rem" />
			</div>
			<div className={styles.asideTagItem}>
				<Skeleton width="0.75rem" height="0.75rem" borderRadius="2px" />
				<Skeleton width="5rem" height="0.75rem" />
			</div>
		</div>
	);
};

export default SkeletonAsideTags;
