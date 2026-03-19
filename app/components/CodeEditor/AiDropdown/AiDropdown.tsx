import { ReactElement, useRef } from "react";

/* Lib */
import { aiActionLabels } from "@/lib/constants/ai";

/* Utils */
import { useClickOutside } from "@/utils/ui.utils";

/* Styles */
import styles from "./aiDropdown.module.css";

type AiDropdownProps = {
	isOpen: boolean;
	onAction: (action: AiAction) => void;
	onClose: () => void;
};

const actions: AiAction[] = [
	"explain",
	"comments",
	"format",
	"optimize",
	"json",
];

const AiDropdown = ({
	isOpen,
	onAction,
	onClose,
}: AiDropdownProps): ReactElement | null => {
	const dropdownRef = useRef<HTMLDivElement>(null);

	useClickOutside(dropdownRef, onClose, isOpen);

	if (!isOpen) {
		return null;
	}

	return (
		<div ref={dropdownRef} className={styles.dropdown}>
			{actions.map((action) => (
				<button
					key={action}
					type="button"
					className={styles.dropdownItem}
					onClick={() => onAction(action)}
				>
					{aiActionLabels[action]}
				</button>
			))}
		</div>
	);
};

export default AiDropdown;
