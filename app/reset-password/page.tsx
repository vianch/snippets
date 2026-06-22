import { ReactElement, Suspense } from "react";
import { Metadata } from "next";

/* Components */
import ResetPasswordForm from "@/components/ResetPasswordForm/ResetPasswordForm";

/* Utils */
import metaGenerator from "@/utils/meta.utils";

/* Styles */
import styles from "./resetPassword.module.css";

export const metadata: Metadata = metaGenerator({
	description: "Set a new password for your Snippets account.",
	title: "Reset password",
	image: "/assets/images/jpg/ss.jpg",
	canonicalPath: "/reset-password",
});

export default function ResetPassword(): ReactElement {
	return (
		<main className={`gradient-background ${styles.main}`}>
			<div className={styles.container}>
				<img
					className={styles.logo}
					src="/assets/images/png/logo.png"
					alt="logo"
					width={128}
				/>

				<h1 className={styles.title}>Choose a new password</h1>

				<Suspense fallback={null}>
					<ResetPasswordForm />
				</Suspense>
			</div>
		</main>
	);
}
