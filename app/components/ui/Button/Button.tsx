import { ButtonHTMLAttributes, ReactElement } from "react";

/* Styles */
import styles from "./button.module.css";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	children: Children;
	className?: string;
	shape?: "default" | "pill";
	variant?: Variants;
	onClick?: () => void;
}

const Button = ({
	children,
	className = "",
	shape = "default",
	variant = "primary",
	onClick,
	...props
}: ButtonProps): ReactElement => {
	return (
		<button
			className={`
			  ${styles.button}
			  ${variant === "primary" && styles.primary}
			  ${variant === "secondary" && styles.secondary}
			  ${variant === "tertiary" && styles.tertiary}
			  ${variant === "cta" && styles.cta}
			  ${shape === "pill" ? styles.pill : ""}
			  ${className}`}
			{...props}
			onClick={onClick}
		>
			{children}
		</button>
	);
};

export default Button;
