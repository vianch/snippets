import { ReactElement } from "react";

/* Components */
import Skeleton from "./Skeleton";

/* Styles */
import styles from "./skeleton.module.css";

type SkeletonTextProps = {
	lines?: number;
	widths?: string[];
};

const SkeletonText = ({
	lines = 3,
	widths = [],
}: SkeletonTextProps): ReactElement => {
	const defaultWidths = ["100%", "80%", "60%"];

	return (
		<div>
			{Array.from({ length: lines }).map((_, index) => (
				<Skeleton
					key={index}
					width={widths[index] ?? defaultWidths[index % defaultWidths.length]}
					height="0.75rem"
					className={styles.textLine}
				/>
			))}
		</div>
	);
};

export default SkeletonText;
