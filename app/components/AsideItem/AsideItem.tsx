import { ReactElement } from "react";

/* Components */
import Folder from "@/components/ui/icons/Folder";
import Tag from "@/components/ui/icons/Tag";

/* Styles */
import Star from "@/components/ui/icons/Start";
import styles from "./asideItem.module.css";

type AsideItemProps = {
	items: Item[];
	iconType: "folder" | "tag" | "star";
};

const AsideItem = ({ items, iconType }: AsideItemProps): ReactElement => {
	if (!items?.length) {
		return <></>;
	}

	return (
		<ul>
			{items.map(({ id, name, numberOfItems }: Item, index: number) => (
				<li className={styles.item} key={`${index + 1}-${id}-item`}>
					{iconType === "folder" && <Folder className={styles.icon} />}
					{iconType === "tag" && <Tag className={styles.icon} />}
					{iconType === "star" && <Star className={styles.icon} />}
					{name}{" "}
					{numberOfItems ? (
						<span className={styles.numberOfItems}>{`(${numberOfItems})`}</span>
					) : (
						<></>
					)}
				</li>
			))}
		</ul>
	);
};

export default AsideItem;
