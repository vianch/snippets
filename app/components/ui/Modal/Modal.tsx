import { ReactElement, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

/* Icons */
import CloseSquare from "@/components/ui/icons/CloseSquare";

/* Styles */
import styles from "./modal.module.css";

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	children: React.ReactNode;
	title?: string;
	className?: string;
	showCloseButton?: boolean;
	closeOnEscape?: boolean;
	closeOnOverlayClick?: boolean;
}

const Modal = ({
	isOpen,
	onClose,
	children,
	title,
	className = "",
	showCloseButton = true,
	closeOnEscape = true,
	closeOnOverlayClick = true,
}: ModalProps): ReactElement | null => {
	const modalRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleEscapeKey = (event: KeyboardEvent) => {
			if (closeOnEscape && event.key === "Escape") {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener("keydown", handleEscapeKey);
			document.body.style.overflow = "hidden";
		}

		return () => {
			document.removeEventListener("keydown", handleEscapeKey);
			document.body.style.overflow = "unset";
		};
	}, [isOpen, onClose, closeOnEscape]);

	const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
		if (closeOnOverlayClick && event.target === event.currentTarget) {
			onClose();
		}
	};

	if (!isOpen) {
		return null;
	}

	const modalContent = (
		<div className={styles.overlay} onClick={handleOverlayClick}>
			<div
				ref={modalRef}
				className={`${styles.modal} ${className}`}
				onClick={(e) => e.stopPropagation()}
			>
				{(title || showCloseButton) && (
					<div className={styles.header}>
						{title && <h2 className={styles.title}>{title}</h2>}
						{showCloseButton && (
							<button
								type="button"
								className={styles.closeButton}
								onClick={onClose}
								aria-label="Close modal"
							>
								<CloseSquare width={24} height={24} />
							</button>
						)}
					</div>
				)}
				<div className={styles.content}>{children}</div>
			</div>
		</div>
	);

	return createPortal(modalContent, document.body);
};

export default Modal;
