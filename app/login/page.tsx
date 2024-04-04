import { ReactElement } from "react";
import { Metadata } from "next";

/* Components */
import AuthForm from "@/components/AuthForm/AuthForm";
import Quotes from "@/components/ui/Quotes/Quotes";

/* Utils */
import metaGenerator from "@/utils/meta.utils";

/* Styles */
import styles from "./login.module.css";

export const metadata: Metadata = metaGenerator({
	description:
		"Snippets login. This is a personal project designed for personal use. Currently, I've closed registrations as I'm in a crucial development phase",
	title: "Snippet Login",
	image: "/assets/images/jpg/ss.jpg",
	canonicalPath: "/login",
});

export default function Login(): ReactElement {
	return (
		<main className={`gradient-background ${styles.main}`}>
			<div className={styles.loginContainer}>
				<img
					className={styles.logo}
					src="/assets/images/png/logo.png"
					alt="logo"
					width={128}
				/>

				<h1 className={styles.title}>Welcome to Snippets</h1>
				<AuthForm />

				<div className={styles.demo}>
					<Quotes>
						<p>Demo User</p>
						<p>Username: demo@vianch.com</p>
						<p>Password: demo</p>
						<p>Leave me a message inside snippets</p>
						<p style={{ textAlign: "center" }}>
							<a
								className={styles.terms}
								href="/terms"
								target="_blank"
								rel="noopener noreferrer"
							>
								Terms and Conditions
							</a>
						</p>
					</Quotes>
				</div>
			</div>
		</main>
	);
}
