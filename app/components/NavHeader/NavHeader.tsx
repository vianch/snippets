import { ReactElement, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

/* components */
import Button from "@/components/ui/Button/Button";
import SignIn from "@/components/ui/icons/SignIn";

/* styles */
import { getUserEmailBySession } from "@/lib/supabase/queries";
import styles from "./navHeader.module.css";

const NavHeader = (): ReactElement => {
	const [isLogged, setIsLogged] = useState<boolean>(false);
	const router = useRouter();

	const loginButtonHandler = () => {
		router.push("/login");
	};

	useEffect(() => {
		getUserEmailBySession().then((email) => {
			if (email) {
				setIsLogged(true);
			}
		});
	}, []);

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

				<nav>
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
