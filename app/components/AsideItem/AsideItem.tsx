import { memo, ReactElement } from "react";

/* Components */
import Tag from "@/components/ui/icons/Tag";

/* Styles */
import styles from "./asideItem.module.css";

type AsideItemProps = {
	active?: string | null;
	ItemIcon?: (props: Icon) => ReactElement;
	items: TagItem[];
	onItemClicked: (name: string) => void;
};

const AsideItem = ({
	active,
	ItemIcon = Tag,
	items,
	onItemClicked,
}: AsideItemProps): ReactElement => {
	if (!items?.length) {
		return <></>;
	}

	return (
		<ul>
			{items.map(({ name, total }: TagItem) => (
				<li
					className={`${styles.item} ${active === name ? styles.active : ""}`}
					key={name}
					title={name}
					onClick={() => onItemClicked(name)}
				>
					<ItemIcon className={styles.icon} />
					<span className={styles.itemName}>{name}</span>
					{total > 0 ? (
						<span className={styles.numberOfItems}>{total}</span>
					) : (
						<></>
					)}
				</li>
			))}
		</ul>
	);
};

export default memo(AsideItem);
