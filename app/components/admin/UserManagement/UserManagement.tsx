"use client";

import { ReactElement, useCallback, useEffect, useState } from "react";

/* Constants */
import {
	AdminApiPaths,
	AdminFormMode,
	AdminUserFilter,
	JsonHeaders,
	RequestStatus,
} from "@/lib/constants/admin.constants";
import { AppRole } from "@/lib/constants/roles";
import { ToastType } from "@/lib/constants/toast";

/* Components */
import UserFormModal from "@/components/admin/UserFormModal/UserFormModal";
import UsersTable from "@/components/admin/UsersTable/UsersTable";
import Alert from "@/components/ui/Alert/Alert";
import Button from "@/components/ui/Button/Button";
import EmptyState from "@/components/ui/EmptyState/EmptyState";
import Input from "@/components/ui/Input/Input";
import Modal from "@/components/ui/Modal/Modal";
import Select from "@/components/ui/Select/Select";
import Skeleton from "@/components/ui/Skeleton/Skeleton";
import MagnifyingGlass from "@/components/ui/icons/MagnifyingGlass";
import Plus from "@/components/ui/icons/Plus";

/* Lib */
import useToastStore from "@/lib/store/toast.store";

/* Styles */
import styles from "./userManagement.module.css";

type UserManagementProps = {
	isReadOnly: boolean;
};

const UserManagement = ({ isReadOnly }: UserManagementProps): ReactElement => {
	const { addToast } = useToastStore();
	const [users, setUsers] = useState<AdminUser[]>([]);
	const [status, setStatus] = useState<RequestStatus>(RequestStatus.Loading);
	const [search, setSearch] = useState<string>("");
	const [filter, setFilter] = useState<AdminUserFilter>(AdminUserFilter.All);
	const [busyUserId, setBusyUserId] = useState<string | null>(null);
	const [resetLink, setResetLink] = useState<string | null>(null);
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
	const [formMode, setFormMode] = useState<AdminFormMode>(AdminFormMode.Create);
	const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
	const [formError, setFormError] = useState<string | null>(null);
	const [confirmUser, setConfirmUser] = useState<AdminUser | null>(null);

	const loadUsers = useCallback(async (): Promise<void> => {
		setStatus(RequestStatus.Loading);

		try {
			// no-store: the browser otherwise serves a stale cached response, so
			// the table only refreshed when devtools had caching disabled.
			const response = await fetch(AdminApiPaths.users, { cache: "no-store" });

			if (!response.ok) {
				throw new Error("Failed to load users");
			}

			const data = (await response.json()) as AdminUsersResponse;

			setUsers(data.users);
			setStatus(RequestStatus.Ready);
		} catch {
			setStatus(RequestStatus.Error);
			addToast({ message: "Could not load users", type: ToastType.Error });
		}
	}, [addToast]);

	useEffect(() => {
		loadUsers();
	}, [loadUsers]);

	const filterOptions: { label: string; value: AdminUserFilter }[] = [
		{ label: "All users", value: AdminUserFilter.All },
		{ label: "Admins", value: AdminUserFilter.Admins },
		{ label: "Users", value: AdminUserFilter.Users },
		{ label: "Disabled", value: AdminUserFilter.Disabled },
	];
	const filterLabel =
		filterOptions.find((option) => option.value === filter)?.label ??
		"All users";
	const normalizedSearch = search.trim().toLowerCase();
	const filteredUsers = users.filter((user) => {
		const matchesSearch =
			normalizedSearch.length === 0 ||
			user.email.toLowerCase().includes(normalizedSearch) ||
			user.username.toLowerCase().includes(normalizedSearch);
		const matchesFilter =
			filter === AdminUserFilter.All ||
			(filter === AdminUserFilter.Admins && user.role === AppRole.Admin) ||
			(filter === AdminUserFilter.Users && user.role === AppRole.User) ||
			(filter === AdminUserFilter.Disabled && user.isDisabled);

		return matchesSearch && matchesFilter;
	});

	const applyMutation = async (
		response: Response,
		successMessage: string
	): Promise<void> => {
		// Error responses are shaped as { error }.
		const body = (await response.json().catch(() => ({}))) as {
			error?: string;
		};

		if (!response.ok) {
			addToast({
				message: body.error ?? "Action failed",
				type: ToastType.Error,
			});

			return;
		}

		addToast({ message: successMessage, type: ToastType.Success });
		await loadUsers();
	};

	const handleFilterSelect = (label: string): void => {
		const match = filterOptions.find((option) => option.label === label);

		setFilter(match?.value ?? AdminUserFilter.All);
	};

	const openCreate = (): void => {
		setFormMode(AdminFormMode.Create);
		setEditingUser(null);
		setFormError(null);
		setIsModalOpen(true);
	};

	const openEdit = (user: AdminUser): void => {
		setFormMode(AdminFormMode.Edit);
		setEditingUser(user);
		setFormError(null);
		setIsModalOpen(true);
	};

	const handleSave = async (values: AdminUserFormValues): Promise<void> => {
		setIsSubmitting(true);
		setFormError(null);

		const isEdit = formMode === AdminFormMode.Edit && editingUser !== null;
		const url = isEdit
			? `${AdminApiPaths.users}/${editingUser?.id}`
			: AdminApiPaths.users;
		const payload = isEdit
			? {
					email: values.email,
					isDisabled: values.isDisabled,
					role: values.role,
					theme: values.theme,
					username: values.username,
				}
			: {
					email: values.email,
					password: values.password,
					role: values.role,
					theme: values.theme,
					username: values.username,
				};
		const response = await fetch(url, {
			body: JSON.stringify(payload),
			headers: JsonHeaders,
			method: isEdit ? "PATCH" : "POST",
		});
		const body = (await response.json().catch(() => ({}))) as {
			error?: string;
		};

		setIsSubmitting(false);

		if (!response.ok) {
			const message = body.error ?? "Could not save user";

			setFormError(message);
			addToast({ message, type: ToastType.Error });

			return;
		}

		setIsModalOpen(false);
		addToast({
			message: isEdit ? "User updated" : "User created",
			type: ToastType.Success,
		});
		await loadUsers();
	};

	const handleToggleDisabled = async (user: AdminUser): Promise<void> => {
		setBusyUserId(user.id);

		const response = await fetch(`${AdminApiPaths.users}/${user.id}`, {
			body: JSON.stringify({ isDisabled: !user.isDisabled }),
			headers: JsonHeaders,
			method: "PATCH",
		});

		await applyMutation(
			response,
			user.isDisabled ? "User enabled" : "User disabled"
		);
		setBusyUserId(null);
	};

	const handleResetPassword = async (user: AdminUser): Promise<void> => {
		setBusyUserId(user.id);
		setResetLink(null);

		const response = await fetch(`${AdminApiPaths.users}/${user.id}/password`, {
			body: JSON.stringify({}),
			headers: JsonHeaders,
			method: "POST",
		});
		const body = (await response.json().catch(() => ({}))) as {
			actionLink?: string;
			error?: string;
		};

		if (!response.ok) {
			addToast({
				message: body.error ?? "Could not reset password",
				type: ToastType.Error,
			});
		} else {
			addToast({
				message: `Recovery link generated for ${user.email}`,
				type: ToastType.Success,
			});
			setResetLink(body.actionLink ?? null);
		}

		setBusyUserId(null);
	};

	const handleConfirmDelete = async (): Promise<void> => {
		if (!confirmUser) {
			return;
		}

		const target = confirmUser;

		setConfirmUser(null);
		setBusyUserId(target.id);

		const response = await fetch(`${AdminApiPaths.users}/${target.id}`, {
			method: "DELETE",
		});

		await applyMutation(response, `${target.email} deleted`);
		setBusyUserId(null);
	};

	const handleDisconnect = async (user: AdminUser): Promise<void> => {
		setBusyUserId(user.id);

		const response = await fetch(
			`${AdminApiPaths.users}/${user.id}/disconnect`,
			{ method: "POST" }
		);
		const body = (await response.json().catch(() => ({}))) as {
			error?: string;
		};

		if (!response.ok) {
			addToast({
				message: body.error ?? "Could not disconnect user",
				type: ToastType.Error,
			});
		} else {
			addToast({
				message: `${user.email} has been signed out`,
				type: ToastType.Success,
			});
		}

		setBusyUserId(null);
	};

	return (
		<div className={styles.container}>
			{isReadOnly && (
				<Alert severity="warning">
					You are signed in as the demo administrator. The user directory is
					read-only — create, edit, and delete are disabled.
				</Alert>
			)}

			{resetLink && (
				<Alert severity="info">
					<div className={styles.notice}>
						<span>Recovery link generated.</span>
						<a
							className={styles.resetLink}
							href={resetLink}
							target="_blank"
							rel="noreferrer"
						>
							Open recovery link
						</a>
					</div>
				</Alert>
			)}

			<div className={styles.toolbar}>
				<div className={styles.search}>
					<Input
						type="text"
						value={search}
						placeholder="Search by email or name"
						maxLength={80}
						disableMargin
						Icon={<MagnifyingGlass width={16} height={16} />}
						onChange={(event) => setSearch(event.target.value)}
					/>
				</div>

				<div className={styles.filter}>
					<Select
						value={filterLabel}
						items={filterOptions.map((option) => option.label)}
						onSelect={handleFilterSelect}
					/>
				</div>

				<Button
					className={styles.iconButton}
					variant="secondary"
					shape="pill"
					onClick={openCreate}
					disabled={isReadOnly}
				>
					<Plus width={16} height={16} /> New user
				</Button>
			</div>

			{status === RequestStatus.Loading && (
				<div className={styles.skeletons}>
					{Array.from({ length: 5 }, (_, index) => (
						<Skeleton key={index} height="3.25rem" />
					))}
				</div>
			)}

			{status === RequestStatus.Error && (
				<Alert severity="error">
					<div className={styles.notice}>
						<span>Could not load users.</span>
						<Button variant="secondary" onClick={loadUsers}>
							Retry
						</Button>
					</div>
				</Alert>
			)}

			{status === RequestStatus.Ready &&
				(filteredUsers.length > 0 ? (
					<UsersTable
						busyUserId={busyUserId}
						isReadOnly={isReadOnly}
						users={filteredUsers}
						onDelete={(user) => setConfirmUser(user)}
						onDisconnect={handleDisconnect}
						onEdit={openEdit}
						onResetPassword={handleResetPassword}
						onToggleDisabled={handleToggleDisabled}
					/>
				) : (
					<EmptyState
						illustration="search"
						title="No users found"
						description="Try a different search or filter."
					/>
				))}

			<UserFormModal
				errorMessage={formError}
				isOpen={isModalOpen}
				isSubmitting={isSubmitting}
				mode={formMode}
				user={editingUser}
				onClose={() => setIsModalOpen(false)}
				onSubmit={handleSave}
			/>

			<Modal
				isOpen={confirmUser !== null}
				onClose={() => setConfirmUser(null)}
				title="Delete user"
				className={styles.confirmModal}
			>
				<div className={styles.confirm}>
					<p className={styles.confirmText}>
						Permanently delete <strong>{confirmUser?.email}</strong> and all
						their snippets? This action cannot be undone.
					</p>
					<div className={styles.buttonContainer}>
						<Button variant="secondary" onClick={() => setConfirmUser(null)}>
							Cancel
						</Button>
						<Button variant="secondary" onClick={handleConfirmDelete}>
							Delete user
						</Button>
					</div>
				</div>
			</Modal>
		</div>
	);
};

export default UserManagement;
