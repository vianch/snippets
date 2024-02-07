import { ReactElement } from "react";

const Folder = ({
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
			<path d="M216,72H130.67L102.93,51.2a16.12,16.12,0,0,0-9.6-3.2H40A16,16,0,0,0,24,64V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V88A16,16,0,0,0,216,72ZM40,64H93.33l21.34,16L93.33,96H40ZM216,200H40V112H93.33a16.12,16.12,0,0,0,9.6-3.2L130.67,88H216Z"></path>
		</svg>
	);
};

export default Folder;
