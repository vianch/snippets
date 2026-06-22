"use client";

import { ReactElement } from "react";

/* Constants */
import { AppRole } from "@/lib/constants/roles";

/* Components */
import Menu from "@/components/ui/Menu/Menu";
import Table from "@/components/ui/Table/Table";
import EyeClosed from "@/components/ui/icons/EyeClosed";
import EyeOpen from "@/components/ui/icons/EyeOpen";
import Lock from "@/components/ui/icons/Lock";
import Settings from "@/components/ui/icons/Settings";
import SignOut from "@/components/ui/icons/SignOut";
import Trash from "@/components/ui/icons/Trash";

/* Styles */
import styles from "./usersTable.module.css";

type UsersTableProps = {
	busyUserId: string | null;
	isReadOnly: boolean;
	onDelete: (user: AdminUser) => void;
	onDisconnect: (user: AdminUser) => void;
	onEdit: (user: AdminUser) => void;
	onResetPassword: (user: AdminUser) => void;
	onToggleDisabled: (user: AdminUser) => void;
	users: AdminUser[];
};

const UsersTable = ({
	busyUserId,
	isReadOnly,
	onDelete,
	onDisconnect,
	onEdit,
	onResetPassword,
	onToggleDisabled,
	users,
}: UsersTableProps): ReactElement => {
	const columns: TableColumn[] = [
		{ label: "User" },
		{ label: "Role" },
		{ label: "Status" },
		{ label: "Theme" },
		{ label: "Created" },
		{ label: "Last sign-in" },
		{ align: "right", label: "Actions" },
	];
	const formatDate = (value: string | null): string => {
		if (!value) {
			return "Never";
		}

		return new Date(value).toLocaleDateString("en-US", {
			day: "numeric",
			month: "short",
			year: "numeric",
		});
	};

	return (
		<Table columns={columns}>
			{users.map((user) => {
				const locked = isReadOnly || user.isDemo;
				const isBusy = busyUserId === user.id;
				const isAdminUser = user.role === AppRole.Admin;
				const cannotDisable = isAdminUser && !user.isDisabled;
				const menuItems: MenuItem[] = [
					{
						disabled: isBusy,
						icon: <Settings width={16} height={16} />,
						label: "Edit user",
						onSelect: () => onEdit(user),
					},
					{
						disabled: isBusy || cannotDisable,
						icon: user.isDisabled ? (
							<EyeOpen width={16} height={16} />
						) : (
							<EyeClosed width={16} height={16} />
						),
						label: cannotDisable
							? "Admins can't be disabled"
							: user.isDisabled
								? "Enable user"
								: "Disable user",
						onSelect: () => onToggleDisabled(user),
					},
					{
						disabled: isBusy,
						icon: <SignOut width={16} height={16} />,
						label: "Force sign-out",
						onSelect: () => onDisconnect(user),
					},
					{
						disabled: isBusy,
						icon: <Lock width={16} height={16} />,
						label: "Reset password",
						onSelect: () => onResetPassword(user),
					},
					{
						danger: true,
						disabled: isBusy || isAdminUser,
						icon: <Trash width={16} height={16} />,
						label: isAdminUser ? "Admins can't be deleted" : "Delete user",
						onSelect: () => onDelete(user),
					},
				];

				return (
					<tr key={user.id} className={user.isDemo ? styles.demoRow : ""}>
						<td>
							<div className={styles.userCell}>
								<span className={styles.userName}>{user.username}</span>
								<span className={styles.userEmail}>{user.email}</span>
							</div>
						</td>
						<td>
							<span
								className={`${styles.badge} ${user.role === AppRole.Admin ? styles.badgeAdmin : styles.badgeUser}`}
							>
								{user.role === AppRole.Admin ? "Admin" : "User"}
							</span>
						</td>
						<td>
							<span
								className={`${styles.badge} ${user.isDisabled ? styles.badgeDisabled : styles.badgeActive}`}
							>
								{user.isDisabled ? "Disabled" : "Active"}
							</span>
						</td>
						<td>
							<span className={styles.theme}>{user.theme}</span>
						</td>
						<td className={styles.muted}>{formatDate(user.createdAt)}</td>
						<td className={styles.muted}>{formatDate(user.lastSignInAt)}</td>
						<td className={styles.actionsCell}>
							{locked ? (
								<span className={styles.lockNote}>
									<Lock width={14} height={14} /> Read-only
								</span>
							) : (
								<Menu items={menuItems} ariaLabel="User actions" />
							)}
						</td>
					</tr>
				);
			})}
		</Table>
	);
};

export default UsersTable;
