import { ReactElement } from "react";

/* Components */
import Button from "@/components/ui/Button/Button";
import Modal from "@/components/ui/Modal/Modal";

/* Styles */
import styles from "./confirmationModal.module.css";

type ConfirmationModalProps = {
	cancelLabel?: string;
	confirmLabel?: string;
	description: string;
	icon: ReactElement;
	isOpen: boolean;
	onCancel: () => void;
	onConfirm: () => void;
	title: string;
};

const ConfirmationModal = ({
	cancelLabel = "Cancel",
	confirmLabel = "Confirm",
	description,
	icon,
	isOpen,
	onCancel,
	onConfirm,
	title,
}: ConfirmationModalProps): ReactElement => {
	return (
		<Modal
			isOpen={isOpen}
			onClose={onCancel}
			showCloseButton={false}
			className={styles.modal}
		>
			<div className={styles.header}>
				<span className={styles.icon}>{icon}</span>
				<h2 className={styles.title}>{title}</h2>
			</div>
			<p className={styles.description}>{description}</p>
			<div className={styles.actions}>
				<Button
					variant="secondary"
					className={styles.button}
					onClick={onCancel}
				>
					{cancelLabel}
				</Button>
				<Button variant="primary" className={styles.button} onClick={onConfirm}>
					{confirmLabel}
				</Button>
			</div>
		</Modal>
	);
};

export default ConfirmationModal;
