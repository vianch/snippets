"use client";

import { ReactElement, useCallback, useEffect, useState } from "react";

/* Constants */
import { AdminApiPaths, RequestStatus } from "@/lib/constants/admin.constants";
import { StorageBackendLabels } from "@/lib/constants/storage.constants";

/* Components */
import DatabaseTableGrid from "@/components/admin/DatabaseExplorer/DatabaseTableGrid";
import Alert from "@/components/ui/Alert/Alert";
import Button from "@/components/ui/Button/Button";
import EmptyState from "@/components/ui/EmptyState/EmptyState";
import Skeleton from "@/components/ui/Skeleton/Skeleton";
import Database from "@/components/ui/icons/Database";
import Rows from "@/components/ui/icons/Rows";

/* Styles */
import styles from "./databaseExplorer.module.css";

// Read-only explorer over whichever backend `storage_config` points at. The
// source is not selectable here on purpose — the server reports the active
// backend, so this view follows the app's real database automatically.
const DatabaseExplorer = (): ReactElement => {
	const [schema, setSchema] = useState<DatabaseSchema | null>(null);
	const [status, setStatus] = useState<RequestStatus>(RequestStatus.Loading);
	const [message, setMessage] = useState<string>("");
	const [selectedTable, setSelectedTable] = useState<string>("");
	const [page, setPage] = useState<number>(0);
	const [rowsPage, setRowsPage] = useState<DatabaseRowsPage | null>(null);
	const [rowsStatus, setRowsStatus] = useState<RequestStatus>(
		RequestStatus.Loading
	);
	const activeTable =
		schema?.tables.find((table) => table.name === selectedTable) ?? null;
	const totalPages = rowsPage
		? Math.max(1, Math.ceil(rowsPage.total / rowsPage.pageSize))
		: 1;

	const readError = async (
		response: Response | null,
		fallback: string
	): Promise<string> => {
		const detail = response
			? ((await response.json().catch(() => null)) as {
					error?: string;
				} | null)
			: null;

		return detail?.error ?? fallback;
	};

	const loadRows = useCallback(
		async (table: DbTable, nextPage: number): Promise<void> => {
			setRowsStatus(RequestStatus.Loading);

			// Pagination needs a stable sort; the primary key is the only column
			// guaranteed to provide one, so tables without a PK go unordered.
			const primaryKey = table.columns.find((column) => column.isPrimaryKey);
			const parameters = new URLSearchParams({
				page: String(nextPage),
				table: table.name,
			});

			if (primaryKey) {
				parameters.set("orderBy", primaryKey.name);
			}

			const response = await fetch(
				`${AdminApiPaths.database}/rows?${parameters.toString()}`
			).catch(() => null);

			if (!response?.ok) {
				setMessage(await readError(response, "Could not read table rows"));
				setRowsStatus(RequestStatus.Error);

				return;
			}

			setRowsPage((await response.json()) as DatabaseRowsPage);
			setMessage("");
			setRowsStatus(RequestStatus.Ready);
		},
		[]
	);

	useEffect(() => {
		const loadSchema = async (): Promise<void> => {
			const response = await fetch(AdminApiPaths.database).catch(() => null);

			if (!response?.ok) {
				setMessage(await readError(response, "Could not read the schema"));
				setStatus(RequestStatus.Error);

				return;
			}

			const data = (await response.json()) as DatabaseSchema;

			setSchema(data);
			setSelectedTable(data.tables[0]?.name ?? "");
			setStatus(RequestStatus.Ready);
		};

		loadSchema();
	}, []);

	useEffect(() => {
		if (activeTable) {
			loadRows(activeTable, page);
		}
	}, [activeTable, page, loadRows]);

	const selectTableHandler = (name: string): void => {
		// Re-clicking the active table must be a no-op. Without this, the resets
		// below clear the rows while `selectedTable` stays put — so `activeTable`
		// keeps its identity, the load effect never re-fires, and the grid empties.
		if (name === selectedTable) {
			return;
		}

		setSelectedTable(name);
		setPage(0);
		setRowsPage(null);
		setMessage("");
	};

	if (status === RequestStatus.Loading) {
		return (
			<div className={styles.container}>
				<Skeleton height="2rem" width="40%" />
				<Skeleton height="18rem" />
			</div>
		);
	}

	if (status === RequestStatus.Error || !schema) {
		return (
			<div className={styles.container}>
				<Alert severity="error">{message}</Alert>
			</div>
		);
	}

	return (
		<div className={styles.container}>
			{/* The selected table's meta lives up here, not above the grid, so the
			    table list and the data table share the same top edge. */}
			<header className={styles.header}>
				<div className={styles.source}>
					<Database width={20} height={20} />
					<div className={styles.sourceText}>
						<span className={styles.sourceName}>
							{StorageBackendLabels[schema.backend]}
						</span>
						<span className={styles.sourceMeta}>
							{schema.dialect} · {schema.tables.length} tables
						</span>
					</div>
				</div>

				{activeTable && (
					<div className={styles.gridMeta}>
						<span>
							{activeTable.columns.length} columns · {rowsPage?.total ?? 0} rows
						</span>
						{activeTable.foreignKeys.map((foreignKey) => (
							<span
								key={`${foreignKey.column}-${foreignKey.targetTable}`}
								className={styles.relation}
							>
								{foreignKey.column} → {foreignKey.targetTable}.
								{foreignKey.targetColumn}
							</span>
						))}
					</div>
				)}
			</header>

			{schema.tables.length === 0 ? (
				<EmptyState
					title="No tables found"
					description="The active backend has no tables in its default schema yet."
				/>
			) : (
				<div className={styles.body}>
					<nav className={styles.tableList}>
						{schema.tables.map((table) => (
							<button
								key={table.name}
								type="button"
								className={`${styles.tableItem} ${table.name === selectedTable ? styles.tableItemActive : ""}`}
								aria-current={table.name === selectedTable}
								onClick={() => selectTableHandler(table.name)}
							>
								<Rows width={15} height={15} />
								<span className={styles.tableName}>{table.name}</span>
								<span className={styles.columnCount}>
									{table.columns.length}
								</span>
							</button>
						))}
					</nav>

					<section className={styles.grid}>
						{message && <Alert severity="error">{message}</Alert>}

						{rowsStatus === RequestStatus.Loading && (
							<Skeleton height="18rem" />
						)}

						{rowsStatus === RequestStatus.Ready && activeTable && rowsPage && (
							<DatabaseTableGrid
								columns={activeTable.columns}
								rows={rowsPage.rows}
							/>
						)}

						{rowsPage && rowsPage.total > rowsPage.pageSize && (
							<div className={styles.pager}>
								<Button
									variant="secondary"
									disabled={page === 0}
									onClick={() => setPage(page - 1)}
								>
									Previous
								</Button>
								<span className={styles.pageLabel}>
									Page {page + 1} of {totalPages}
								</span>
								<Button
									variant="secondary"
									disabled={page + 1 >= totalPages}
									onClick={() => setPage(page + 1)}
								>
									Next
								</Button>
							</div>
						)}
					</section>
				</div>
			)}
		</div>
	);
};

export default DatabaseExplorer;
