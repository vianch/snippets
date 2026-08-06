import { ReactElement } from "react";

/* Components */
import Skeleton from "./Skeleton";

/* Styles */
import styles from "./skeleton.module.css";

const SkeletonCodeEditor = (): ReactElement => {
	return (
		<div className={styles.editorContainer}>
			{/* Mirrors CodeEditorHeader group for group: ★ / title / ⓘ on the left,
			    the tag chip in the middle, and Select / Save / ⋯ pinned right. Sizes
			    track --row-control-height so the row does not shift on hydration. */}
			<div className={styles.editorHeader}>
				<div className={styles.editorHeaderIdentity}>
					<Skeleton
						width="var(--row-control-height)"
						height="var(--row-control-height)"
						borderRadius="var(--border-radius)"
					/>
					<Skeleton
						width="12rem"
						height="2rem"
						borderRadius="var(--border-radius)"
					/>
					<Skeleton
						width="var(--row-control-height)"
						height="var(--row-control-height)"
						borderRadius="var(--border-radius)"
					/>
				</div>

				<div className={styles.editorHeaderTags}>
					<Skeleton
						width="5.5rem"
						height="var(--row-control-height)"
						borderRadius="999px"
					/>
				</div>

				<div className={styles.editorHeaderActions}>
					<Skeleton
						width="6rem"
						height="var(--row-control-height)"
						borderRadius="999px"
					/>
					<Skeleton
						width="5.5rem"
						height="var(--row-control-height)"
						borderRadius="999px"
					/>
					<Skeleton
						className={styles.editorHeaderMenu}
						width="var(--row-control-height)"
						height="var(--row-control-height)"
						borderRadius="var(--border-radius-md)"
					/>
				</div>
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
