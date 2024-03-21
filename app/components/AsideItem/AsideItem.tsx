import { ReactElement } from "react";

/* Components */
import Tag from "@/components/ui/icons/Tag";

/* Styles */
import styles from "./asideItem.module.css";

type AsideItemProps = {
	active?: string | null;
	items: TagItem[];
	onItemClicked: (name: string) => void;
};

const AsideItem = ({
	active,
	items,
	onItemClicked,
}: AsideItemProps): ReactElement => {
	if (!items?.length) {
		return <></>;
	}

	return (
		<ul>
			{items.map(({ name, total }: TagItem, index: number) => (
				<li
					className={`${styles.item} ${active === name ? styles.active : ""}`}
					key={`${index + 1}-tag-item`}
					onClick={() => onItemClicked(name)}
				>
					<Tag className={styles.icon} />
					{name}{" "}
					{total > 0 ? (
						<span className={styles.numberOfItems}>{`(${total})`}</span>
					) : (
						<></>
					)}
				</li>
			))}
		</ul>
	);
};

export default AsideItem;
