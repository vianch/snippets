import { ReactElement, useState, useEffect, ChangeEvent } from "react";

/* Styles */
import styles from "./input.module.css";

const Input = ({
	className = "",
	dark = true,
	type = "text",
	placeholder = "",
	required = false,
	maxLength = 50,
	Icon = null,
	value,
	onChange,
	onBlur,
}: InputProps): ReactElement => {
	const [updatedValue, setUpdatedValue] = useState<
		string | number | readonly string[] | undefined
	>(value);

	const onChangeValue = (event: ChangeEvent<HTMLInputElement>): void => {
		setUpdatedValue(event.target.value);

		if (onChange) {
			onChange(event);
		}
	};

	useEffect(() => {
		setUpdatedValue(value);
	}, [value]);

	return (
		<div
			className={`${styles.inputContainer} ${dark ? styles.inputDark : styles.inputLight}`}
		>
			{Icon && <span className={styles.iconContainer}>{Icon}</span>}

			<input
				className={`${styles.input} ${dark ? styles.inputDark : styles.inputLight} ${className}`}
				type={type}
				onBlur={onBlur}
				value={updatedValue}
				contentEditable
				placeholder={placeholder}
				required={required}
				maxLength={maxLength}
				onChange={onChangeValue}
			/>
		</div>
	);
};

export default Input;
