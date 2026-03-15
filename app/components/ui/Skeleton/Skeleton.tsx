import { ReactElement } from "react";

/* Styles */
import styles from "./skeleton.module.css";

type SkeletonProps = {
	width?: string;
	height?: string;
	borderRadius?: string;
	className?: string;
};

const Skeleton = ({
	width = "100%",
	height = "1rem",
	borderRadius = "4px",
	className = "",
}: SkeletonProps): ReactElement => {
	return (
		<div
			className={`${styles.skeleton} ${className}`}
			style={{ width, height, borderRadius }}
		/>
	);
};

export default Skeleton;
