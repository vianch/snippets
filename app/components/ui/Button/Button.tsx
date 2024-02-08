import { ButtonHTMLAttributes, ReactElement } from "react";

/* Styles */
import styles from "./button.module.css";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	children: Children;
	className?: string;
	variant?: Variants;
	onClick?: () => void;
}

const Button = ({
	children,
	className,
	variant,
	onClick,
	...props
}: ButtonProps): ReactElement => {
	return (
		<button
			className={`${styles.button} ${className}`}
			{...props}
			onClick={onClick}
		>
			{children}
		</button>
	);
};

export default Button;
