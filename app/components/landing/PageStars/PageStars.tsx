import { ReactElement } from "react";

import { pageStars } from "@/lib/constants/pageStars";

import styles from "./pageStars.module.css";

const PageStars = (): ReactElement => {
	return (
		<div aria-hidden="true" className={styles.pageStars}>
			{pageStars.map((star, index) => (
				<span
					className={styles.dot}
					key={index}
					style={{
						animationDelay: `${star.delay}s`,
						height: `${star.size}px`,
						left: `${star.left}%`,
						top: `${star.top}%`,
						width: `${star.size}px`,
					}}
				/>
			))}
		</div>
	);
};

export default PageStars;
