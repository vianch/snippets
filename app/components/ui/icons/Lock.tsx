import { ReactElement } from "react";

const Lock = ({
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
			<path d="M208,80H176V56a48,48,0,0,0-96,0V80H48A16,16,0,0,0,32,96V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V96A16,16,0,0,0,208,80ZM96,56a32,32,0,0,1,64,0V80H96ZM208,208H48V96H208V208Z"></path>
		</svg>
	);
};

export default Lock;
