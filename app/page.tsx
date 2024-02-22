"use client";

import { ReactElement } from "react";
import { useRouter } from "next/navigation";

import Quotes from "@/components/ui/Quotes/Quotes";
import Button from "@/components/ui/Button/Button";
import SignIn from "@/components/ui/icons/SignIn";
import styles from "./page.module.css";

export default function Home(): ReactElement {
	const router = useRouter();

	const loginButtonHandler = () => {
		router.push("/login");
	};

	return (
		<main className={` ${styles.main}`}>
			<header className={styles.header}>
				<div className={`container ${styles.headerContainer}`}>
					<span className={styles.logo}>
						<img
							className={styles.logoImage}
							src="/assets/images/png/logo.png"
							alt="logo"
							width="48"
							height="48"
						/>
						Snippets
					</span>

					<nav>
						<Button
							className={styles.button}
							onClick={loginButtonHandler}
							variant="tertiary"
						>
							<SignIn className={styles.signInIcon} width={16} height={16} />{" "}
							Login
						</Button>
					</nav>
				</div>
			</header>

			<section className={styles.topSection}>
				<div className={`container ${styles.top}`}>
					<h1 className={styles.title}>
						Your Snippets, Anytime, Everywhere You Go!
					</h1>

					<p className={styles.description}>
						Your sanctuary for organized code brilliance. Easily manage,
						retrieve, and thrive in coding.
					</p>

					<img
						className={styles.image}
						src="/assets/images/jpg/ss.jpg"
						alt="screenshot"
						width="1140"
					/>
				</div>
			</section>

			<section className={`container ${styles.info}`}>
				<Quotes>
					<p>
						As I&apos;m currently in a crucial development phase, I&apos;ve
						temporarily closed registrations. Being a personal project, server
						costs are a challenge, however, I&apos;m working on a solution to
						make Snippets open to everyone soon.
					</p>

					<p>
						<strong>Private Open Beta Announcement: </strong> A private open
						beta is on the horizon, set to launch this summer! Requests will
						open soon!
					</p>

					<p>
						<strong>Vision: </strong>I want Snippet to be free and open for
						everyone. As I strive to make coding more accessible, your support
						and enthusiasm mean the world to me.
					</p>
				</Quotes>
			</section>

			<section className={`container ${styles.copyRight}`}>
				2024 snippets.vianch.
			</section>
		</main>
	);
}
