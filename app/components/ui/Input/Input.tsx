import {
	ReactElement,
	useState,
	useEffect,
	ChangeEvent,
	KeyboardEvent,
	FocusEvent,
} from "react";

/* Styles */
import styles from "./input.module.css";

const Input = ({
	className = "",
	cleanOnBlur = false,
	fat = false,
	dark = true,
	disabled = false,
	disableMargin = false,
	type = "text",
	placeholder = "",
	required = false,
	maxLength = 50,
	Icon = null,
	value,
	onChange,
	onKeyDown,
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

	const handlerKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		if (
			onKeyDown &&
			(event.key === "Enter" ||
				event.code === "Enter" ||
				event?.keyCode === 13 ||
				event.key === "Tab" ||
				event.code === "Tab" ||
				event?.keyCode === 9)
		) {
			onKeyDown(updatedValue as string);
			setUpdatedValue("");
		}
	};

	const handlerOnBlur = (event: FocusEvent<HTMLInputElement>): void => {
		if (cleanOnBlur && onBlur) {
			setUpdatedValue("");
		}

		if (onBlur) {
			onBlur(event?.target?.value ?? null);
		}
	};

	return (
		<div
			className={`${disableMargin ? styles.marginDisabled : styles.marginEnabled} ${styles.inputContainer} ${fat ? styles.isFat : styles.isFit} ${dark ? styles.inputDark : styles.inputLight} `}
		>
			{Icon && <span className={styles.iconContainer}>{Icon}</span>}

			<input
				className={`${styles.input} ${dark ? styles.inputDark : styles.inputLight} ${className}`}
				type={type}
				onBlur={handlerOnBlur}
				value={updatedValue}
				contentEditable
				disabled={disabled}
				aria-disabled={disabled}
				placeholder={placeholder}
				required={required}
				maxLength={maxLength}
				onChange={onChangeValue}
				onKeyDown={handlerKeyDown}
			/>
		</div>
	);
};

export default Input;
