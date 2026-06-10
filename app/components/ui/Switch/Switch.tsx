import { ChangeEvent, ReactElement } from "react";

/* Styles */
import styles from "./switch.module.css";

type SwitchProps = {
	checked: boolean;
	description?: string;
	disabled?: boolean;
	label: string;
	onChange: (checked: boolean) => void;
};

const Switch = ({
	checked,
	description,
	disabled = false,
	label,
	onChange,
}: SwitchProps): ReactElement => {
	const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
		onChange(event.target.checked);
	};

	return (
		<label className={`${styles.switchRow} ${disabled ? styles.disabled : ""}`}>
			<span className={styles.copy}>
				<span className={styles.label}>{label}</span>
				{description && (
					<span className={styles.description}>{description}</span>
				)}
			</span>
			<input
				type="checkbox"
				role="switch"
				className={styles.input}
				checked={checked}
				disabled={disabled}
				onChange={handleChange}
			/>
		</label>
	);
};

export default Switch;
