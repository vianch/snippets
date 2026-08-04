import { ReactElement } from "react";

const FocusMode = ({
	className = "",
	fill = "currentColor",
	viewBox = "0 0 256 256",
	width = "32",
	height = "32",
	onClick,
}: Icon): ReactElement => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			className={className}
			width={width}
			height={height}
			fill={fill}
			viewBox={viewBox}
			onClick={onClick}
		>
			<path d="M48,96V56a8,8,0,0,1,8-8H96a8,8,0,0,1,0,16H64V96a8,8,0,0,1-16,0Zm112-40a8,8,0,0,0,0,16h32V96a8,8,0,0,0,16,0V56a8,8,0,0,0-8-8Zm48,104a8,8,0,0,0-8,8v32H160a8,8,0,0,0,0,16h40a8,8,0,0,0,8-8V160A8,8,0,0,0,208,160ZM96,192H64V160a8,8,0,0,0-16,0v40a8,8,0,0,0,8,8H96a8,8,0,0,0,0-16Z" />
		</svg>
	);
};

export default FocusMode;
