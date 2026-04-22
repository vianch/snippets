import { ReactElement } from "react";

const DotsThree = ({
	className = "",
	width = 16,
	height = 16,
}: Icon): ReactElement => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			className={className}
			width={width}
			height={height}
			viewBox="0 0 256 256"
			fill="currentColor"
		>
			<circle cx="60" cy="128" r="16" />
			<circle cx="128" cy="128" r="16" />
			<circle cx="196" cy="128" r="16" />
		</svg>
	);
};

export default DotsThree;
