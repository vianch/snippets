import { ReactElement, useEffect, useRef, useState } from "react";
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
	const [isRendered, setIsRendered] = useState<boolean>(isOpen);

	useEffect(() => {
		if (isOpen) {
			setIsRendered(true);
		}
	}, [isOpen]);

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

	const handlePanelAnimationEnd = (
		event: React.AnimationEvent<HTMLDivElement>
	): void => {
		if (!isOpen && event.target === event.currentTarget) {
			setIsRendered(false);
		}
	};

	if (!isRendered) {
		return null;
	}

	const isClosing = !isOpen;

	const modalContent = (
		<div
			className={`${styles.overlay} ${isClosing ? styles.overlayClosing : ""}`}
			onClick={handleOverlayClick}
		>
			<div
				ref={modalRef}
				className={`${styles.modal} ${isClosing ? styles.modalClosing : ""} ${className}`}
				role="dialog"
				aria-modal="true"
				onClick={(event) => event.stopPropagation()}
				onAnimationEnd={handlePanelAnimationEnd}
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
