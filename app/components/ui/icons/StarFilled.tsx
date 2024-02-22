import { ReactElement } from "react";

const StarFilled = ({
	className = "",
	fill = "#EFCE4A",
	viewBox = "0 0 53.867 53.867",
	width = "32",
	height = "32",
	onClick,
}: Icon): ReactElement => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className={className}
		stroke="currentColor"
		width={width}
		height={height}
		fill={fill}
		viewBox={viewBox}
		onClick={onClick}
	>
		<polygon
			fill={fill}
			points="26.934,1.318 35.256,18.182 53.867,20.887 40.4,34.013 43.579,52.549 26.934,43.798
	10.288,52.549 13.467,34.013 0,20.887 18.611,18.182 "
		/>
	</svg>
);

export default StarFilled;
