import { ReactElement, ReactNode } from "react";

interface IconProps extends Icon {
	children: ReactNode;
}

const IconContainer = ({
	children,
	className = "",
	fill = "currentColor",
	viewBox = "0 0 254 254",
	width = "32",
	height = "32",
	onClick = () => {},
}: IconProps): ReactElement => {
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
			{children}
		</svg>
	);
};

export default IconContainer;
