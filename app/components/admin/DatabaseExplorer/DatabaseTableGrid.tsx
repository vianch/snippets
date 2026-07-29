"use client";

import { ReactElement } from "react";

/* Constants */
import { NullDisplayValue } from "@/lib/constants/database.constants";

/* Components */
import Table from "@/components/ui/Table/Table";

/* Styles */
import styles from "./databaseTableGrid.module.css";

type DatabaseTableGridProps = {
	columns: DbColumn[];
	rows: Record<string, string | null>[];
};

const DatabaseTableGrid = ({
	columns,
	rows,
}: DatabaseTableGridProps): ReactElement => {
	const tableColumns: TableColumn[] = columns.map((column) => ({
		label: `${column.name}  ${column.dataType}`,
	}));

	return (
		<Table columns={tableColumns}>
			{rows.map((row, index) => (
				// ponytail: index key — a table may have no primary key, and the whole
				// page is replaced on every fetch, so there is nothing stabler to use.
				<tr key={index}>
					{columns.map((column) => {
						const value = row[column.name] ?? null;

						return (
							<td key={column.name} className={styles.cell}>
								{value === null ? (
									<span className={styles.nullValue}>{NullDisplayValue}</span>
								) : (
									<span className={styles.value} title={value}>
										{value}
									</span>
								)}
							</td>
						);
					})}
				</tr>
			))}
		</Table>
	);
};

export default DatabaseTableGrid;
