import { ReactElement } from "react";

/* Components */
import Skeleton from "./Skeleton";

/* Styles */
import styles from "./skeleton.module.css";

type SkeletonActionsProps = {
	count?: number;
};

const SkeletonActions = ({ count = 6 }: SkeletonActionsProps): ReactElement => {
	return (
		<div className={styles.editorActions}>
			{Array.from({ length: count }).map((_, index) => (
				<Skeleton
					key={index}
					width="1.5rem"
					height="1.5rem"
					borderRadius="0.313rem"
				/>
			))}
		</div>
	);
};

export default SkeletonActions;
