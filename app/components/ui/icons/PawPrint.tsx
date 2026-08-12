import { ReactElement } from "react";

const PawPrint = ({
	className = "",
	fill = "currentColor",
	viewBox = "0 0 256 256",
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
			<path d="M212,120a24,24,0,1,1-24-24A24,24,0,0,1,212,120ZM68,96a24,24,0,1,0,24,24A24,24,0,0,0,68,96ZM96,76a24,24,0,1,0-24-24A24,24,0,0,0,96,76Zm64,0a24,24,0,1,0-24-24A24,24,0,0,0,160,76Zm12.8,68.8a40,40,0,0,1-17.3-19.4,32,32,0,0,0-55,0A40,40,0,0,1,83.2,144.8,40,40,0,0,0,96,224a39.3,39.3,0,0,0,15.2-3,44,44,0,0,1,33.6,0A39.3,39.3,0,0,0,160,224a40,40,0,0,0,12.8-79.2Z"></path>
		</svg>
	);
};

export default PawPrint;
