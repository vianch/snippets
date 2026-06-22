import { ReactElement } from "react";

const DotsThreeVertical = ({
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
			<circle cx="128" cy="60" r="16" />
			<circle cx="128" cy="128" r="16" />
			<circle cx="128" cy="196" r="16" />
		</svg>
	);
};

export default DotsThreeVertical;
