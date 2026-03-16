import { ReactElement } from "react";

const Format = ({
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
			stroke="currentColor"
			width={width}
			height={height}
			fill={fill}
			viewBox={viewBox}
			onClick={onClick}
		>
			<path d="M200,40H56A16,16,0,0,0,40,56V200a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V56A16,16,0,0,0,200,40Zm0,160H56V56H200ZM80,96A8,8,0,0,1,88,88h80a8,8,0,0,1,0,16H88A8,8,0,0,1,80,96Zm0,32a8,8,0,0,1,8-8h80a8,8,0,0,1,0,16H88A8,8,0,0,1,80,128Zm0,32a8,8,0,0,1,8-8h48a8,8,0,0,1,0,16H88A8,8,0,0,1,80,160Z"></path>
		</svg>
	);
};

export default Format;
