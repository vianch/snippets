"use client";

import { ReactElement } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

/* components */
import Button from "@/components/ui/Button/Button";
import Github from "@/components/ui/icons/Github";
import SignIn from "@/components/ui/icons/SignIn";

/* Lib */
import useLoggedUser from "@/lib/hooks/useLoggedUser";

/* styles */
import styles from "./navHeader.module.css";

const NavHeader = (): ReactElement => {
	const { isLogged } = useLoggedUser();
	const router = useRouter();

	const loginButtonHandler = () => {
		router.push("/login");
	};

	return (
		<header className={styles.header}>
			<div className={`container ${styles.headerContainer}`}>
				<Link href="/" className={styles.logo}>
					<img
						className={styles.logoImage}
						src="/assets/images/png/logo.png"
						alt="logo"
						width={48}
						height={48}
					/>
					Snippets
				</Link>

				<nav className={styles.nav}>
					<a
						className={styles.githubLink}
						href="https://github.com/vianch/snippets"
						target="_blank"
						rel="noopener noreferrer"
					>
						<Github width={16} height={16} />
						GitHub
					</a>

					<Button
						className={styles.button}
						onClick={loginButtonHandler}
						variant="tertiary"
					>
						<SignIn className={styles.signInIcon} width={16} height={16} />{" "}
						{isLogged ? "Dashboard" : "Login"}
					</Button>
				</nav>
			</div>
		</header>
	);
};

export default NavHeader;
