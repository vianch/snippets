import { ReactElement, useState, useRef, useCallback } from "react";

/* Components */
import CaretDown from "@/components/ui/icons/CaretDown";
import Check from "@/components/ui/icons/Check";

/* Utils */
import { useClickOutside } from "@/utils/ui.utils";

/* Styles */
import styles from "./select.module.css";

type SelectProps = {
	value: string;
	items: string[];
	onSelect: (value: string) => void;
};

const Select = ({ value, items, onSelect }: SelectProps): ReactElement => {
	const [isOpen, setIsOpen] = useState(false);
	const selectWindowRef = useRef<HTMLDivElement>(null);

	const closeDropdown = useCallback(() => setIsOpen(false), []);

	useClickOutside(selectWindowRef, closeDropdown, isOpen);

	const selectItemHandler = (item: string): void => {
		onSelect(item);
		setIsOpen(false);
	};

	return (
		<div className={styles.selectContainer} ref={selectWindowRef}>
			<div
				className={styles.infoBarContainer}
				onClick={() => setIsOpen(!isOpen)}
			>
				{value} <CaretDown className={styles.caret} width={16} height={16} />
			</div>

			<div
				className={`${styles.selectWindow} ${isOpen ? styles.showList : styles.hideList}`}
			>
				{items.map((item) => (
					<div
						className={`${item === value && styles.active} ${styles.selectItem}`}
						key={item}
						onClick={() => selectItemHandler(item)}
					>
						{item === value ? <Check width={12} height={12} /> : "- "}
						{item}
					</div>
				))}
			</div>
		</div>
	);
};

export default Select;
