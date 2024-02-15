import { ReactElement } from "react";

/* Styles */
import AuthForm from "@/components/AuthForm/AuthForm";
import styles from "./page.module.css";

/* Components */

export default function Home(): ReactElement {
	return (
		<main className={`gradient-background ${styles.main}`}>
			<div className={styles.loginContainer}>
				<img
					className={styles.logo}
					src="/assets/images/png/logo.png"
					alt="logo"
					width="128"
				/>

				<h1 className={styles.title}>Welcome to Snippets</h1>
				<AuthForm />
			</div>
		</main>
	);
}
