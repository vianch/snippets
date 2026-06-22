import { ReactElement, ReactNode } from "react";

/* Styles */
import styles from "./table.module.css";

type TableProps = {
	children: ReactNode;
	columns: TableColumn[];
};

// Styled table shell. The consumer supplies the `<tr>` rows as children; the
// primitive owns the wrapper, header, and cell chrome.
const Table = ({ children, columns }: TableProps): ReactElement => {
	return (
		<div className={styles.wrap}>
			<table className={styles.table}>
				<thead>
					<tr>
						{columns.map((column) => (
							<th
								key={column.label}
								className={column.align === "right" ? styles.right : ""}
							>
								{column.label}
							</th>
						))}
					</tr>
				</thead>
				<tbody>{children}</tbody>
			</table>
		</div>
	);
};

export default Table;
