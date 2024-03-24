"use client";

import { ReactElement } from "react";

import Quotes from "@/components/ui/Quotes/Quotes";
import NavHeader from "@/components/NavHeader/NavHeader";
import Footer from "@/components/Footer/Footer";

import styles from "./page.module.css";

export default function Home(): ReactElement {
	return (
		<main className={` ${styles.main}`}>
			<NavHeader />

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
						width={1140}
					/>
				</div>
			</section>

			<section className={`container ${styles.info}`}>
				<Quotes>
					<p>
						This is a personal project designed for personal use. Currently,
						I&apos;ve closed registrations as I&apos;m in a crucial development
						phase, and server costs pose a challenge. However, if you&apos;re
						interested in accessing the demo or find it useful, please feel free
						to contact me at{" "}
						<a className={styles.email} href="mailto:info@vianch.com">
							info@vianch.com
						</a>
						.
					</p>

					<p>
						Don&apos;t forget to read the{" "}
						<a
							className={styles.terms}
							href="/terms"
							target="_blank"
							rel="noopener noreferrer"
						>
							Terms and Conditions
						</a>{" "}
						before using the platform. Thank you!
					</p>
				</Quotes>
			</section>

			<Footer />
		</main>
	);
}
