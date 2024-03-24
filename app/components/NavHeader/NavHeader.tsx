import { ReactElement } from "react";
import { useRouter } from "next/navigation";

/* components */
import Button from "@/components/ui/Button/Button";
import SignIn from "@/components/ui/icons/SignIn";

/* styles */
import styles from "./navHeader.module.css";

const NavHeader = (): ReactElement => {
	const router = useRouter();

	const loginButtonHandler = () => {
		router.push("/login");
	};

	return (
		<header className={styles.header}>
			<div className={`container ${styles.headerContainer}`}>
				<a href="/" className={styles.logo}>
					<img
						className={styles.logoImage}
						src="/assets/images/png/logo.png"
						alt="logo"
						width={48}
						height={48}
					/>
					Snippets
				</a>

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
	);
};

export default NavHeader;
