"use client";

import { FC, ReactElement } from "react";

/* Lib	 */
import useToastStore from "@/lib/store/toast.store";

/* Styles */
import styles from "./toasty.module.css";

const Toasty: FC = (): ReactElement => {
	const { toasts, position, closeSingleToast } = useToastStore();

	if (!toasts?.length) return <></>;

	return (
		<div className={`${styles.toasty} ${styles[`toasty--${position}`]}`}>
			{toasts.map((toast: Toast) =>
				toast?.id ? (
					<div
						key={toast.id}
						id={toast.id}
						className={`${styles.toast} ${styles[`toast--${toast.type}`]}`}
						onClick={() => closeSingleToast(toast.id || "")}
					>
						{toast.title && <h4 className={styles.title}>{toast.title}</h4>}
						<p className={styles.message}>{toast.message}</p>
					</div>
				) : (
					<> </>
				)
			)}
		</div>
	);
};

export default Toasty;
