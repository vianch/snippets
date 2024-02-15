import { ReactElement } from "react";

/* Styles */
import styles from "./input.module.css";

const Input = ({
	className = "",
	dark = true,
	type = "text",
	placeholder = "",
	value,
	required = false,
	maxLength = 50,
	Icon = null,
	onChange,
}: InputProps): ReactElement => {
	return (
		<div
			className={`${styles.inputContainer} ${dark ? styles.inputDark : styles.inputLight}`}
		>
			{Icon && <span className={styles.iconContainer}>{Icon}</span>}

			<input
				className={`${styles.input} ${dark ? styles.inputDark : styles.inputLight} ${className}`}
				type={type}
				placeholder={placeholder}
				value={value}
				required={required}
				maxLength={maxLength}
				onChange={onChange}
			/>
		</div>
	);
};

export default Input;
