"use client";

import { ReactElement, useState } from "react";
import { useRouter } from "next/navigation";

/* Constants */
import { demoAccountData } from "@/lib/constants/account";
import { AdminTab } from "@/lib/constants/admin.constants";

/* Components */
import SnippetAnalytics from "@/components/admin/SnippetAnalytics/SnippetAnalytics";
import UserManagement from "@/components/admin/UserManagement/UserManagement";
import Button from "@/components/ui/Button/Button";
import Book from "@/components/ui/icons/Book";
import ListChecks from "@/components/ui/icons/ListChecks";
import ShieldCheck from "@/components/ui/icons/ShieldCheck";
import User from "@/components/ui/icons/User";

/* Lib */
import useCurrentUser from "@/lib/hooks/useCurrentUser";

/* Styles */
import styles from "./adminDashboard.module.css";

const AdminDashboard = (): ReactElement => {
	const router = useRouter();
	const { email } = useCurrentUser();
	const [section, setSection] = useState<AdminTab>(AdminTab.Users);
	const isReadOnly =
		(email ?? "").toLowerCase() === demoAccountData.email.toLowerCase();
	const navItems: { icon: ReactElement; label: string; value: AdminTab }[] = [
		{
			icon: <User width={18} height={18} />,
			label: "Users",
			value: AdminTab.Users,
		},
		{
			icon: <ListChecks width={18} height={18} />,
			label: "Analytics",
			value: AdminTab.Analytics,
		},
	];

	return (
		<div className={styles.page}>
			<aside className={styles.sidebar}>
				<div className={styles.brand}>
					<span className={styles.brandIcon}>
						<ShieldCheck width={20} height={20} />
					</span>
					<span className={styles.brandTitle}>Admin</span>
					{isReadOnly && <span className={styles.demoTag}>Demo</span>}
				</div>

				<nav className={styles.nav}>
					{navItems.map((item) => (
						<button
							key={item.value}
							type="button"
							className={`${styles.navItem} ${section === item.value ? styles.navItemActive : ""}`}
							aria-current={section === item.value}
							onClick={() => setSection(item.value)}
						>
							<span className={styles.navIcon}>{item.icon}</span>
							<span className={styles.navLabel}>{item.label}</span>
						</button>
					))}
				</nav>

				<Button
					className={styles.backButton}
					variant="secondary"
					onClick={() => router.push("/snippets")}
				>
					<Book width={16} height={16} /> Back to app
				</Button>
			</aside>

			<main className={styles.main}>
				{section === AdminTab.Users ? (
					<UserManagement isReadOnly={isReadOnly} />
				) : (
					<SnippetAnalytics />
				)}
			</main>
		</div>
	);
};

export default AdminDashboard;
