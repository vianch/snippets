import { ReactElement } from "react";

const MagnifyingGlass = ({
	className = "",
	fill = "currentColor",
	viewBox = "0 0 254 254",
	width = "32",
	height = "32",
}: Icon): ReactElement => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			className={className}
			stroke="currentColor"
			width={width}
			height={height}
			fill={fill}
			viewBox={viewBox}
		>
			<path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
		</svg>
	);
};

export default MagnifyingGlass;
