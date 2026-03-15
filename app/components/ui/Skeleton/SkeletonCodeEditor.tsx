import { ReactElement } from "react";

/* Components */
import Skeleton from "./Skeleton";

/* Styles */
import styles from "./skeleton.module.css";

const SkeletonCodeEditor = (): ReactElement => {
	return (
		<div className={styles.editorContainer}>
			<div className={styles.editorHeader}>
				<div className={styles.editorHeaderLeft}>
					<Skeleton width="1.25rem" height="1.25rem" borderRadius="50%" />
					<Skeleton width="12rem" height="1.25rem" />
				</div>
				<div className={styles.editorHeaderRight}>
					<Skeleton width="5rem" height="1.5rem" borderRadius="4px" />
					<Skeleton width="4rem" height="1.5rem" borderRadius="4px" />
				</div>
			</div>

			<div className={styles.editorTags}>
				<Skeleton width="5rem" height="1.5rem" borderRadius="12px" />
				<Skeleton width="4rem" height="1.5rem" borderRadius="12px" />
				<Skeleton width="6rem" height="1.5rem" borderRadius="12px" />
			</div>

			<div className={styles.editorCode}>
				<Skeleton width="60%" height="0.75rem" />
				<Skeleton width="80%" height="0.75rem" />
				<Skeleton width="45%" height="0.75rem" />
				<Skeleton width="90%" height="0.75rem" />
				<Skeleton width="35%" height="0.75rem" />
				<Skeleton width="70%" height="0.75rem" />
				<Skeleton width="55%" height="0.75rem" />
				<Skeleton width="40%" height="0.75rem" />
			</div>
		</div>
	);
};

export default SkeletonCodeEditor;
