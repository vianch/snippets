import { ReactElement, useEffect, useState, useRef } from "react";

import CaretDown from "@/components/ui/icons/CaretDown";

import Check from "@/components/ui/icons/Check";
import styles from "./select.module.css";

type SelectProps = {
	value: string;
	items: string[];
	onSelect: (value: string) => void;
};

const Select = ({ value, items, onSelect }: SelectProps): ReactElement => {
	const [isOpen, setIsOpen] = useState(false);
	const selectWindowRef = useRef<HTMLInputElement>(null);

	const selectItemHandler = (item: string): void => {
		onSelect(item);
		setIsOpen(false);
	};

	// TODO: Move this outside to page level if there are more mouse events to handle
	const handleClickOutside = (event: MouseEvent) => {
		if (
			selectWindowRef.current &&
			!selectWindowRef.current?.contains(event?.target as Node)
		) {
			setIsOpen(false);
		}
	};

	useEffect(() => {
		document.addEventListener("mousedown", handleClickOutside);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	return (
		<div className={styles.selectContainer}>
			<div
				className={styles.infoBarContainer}
				onClick={() => setIsOpen(!isOpen)}
			>
				{value} <CaretDown className={styles.caret} width={16} height={16} />
			</div>

			<div
				className={`${styles.selectWindow} ${isOpen ? styles.showList : styles.hideList}`}
				ref={selectWindowRef}
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
