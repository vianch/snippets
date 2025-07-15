import { ReactElement } from "react";

import IconContainer from "@/components/ui/icons/Icon";

const Copy = (props: Icon): ReactElement => {
	return (
		<IconContainer {...props}>
			<path d="M216,32H88a8,8,0,0,0-8,8V80H40a8,8,0,0,0-8,8V216a8,8,0,0,0,8,8H168a8,8,0,0,0,8-8V176h40a8,8,0,0,0,8-8V40A8,8,0,0,0,216,32ZM160,208H48V96H160Zm48-48H176V88a8,8,0,0,0-8-8H96V48H208Z"></path>
		</IconContainer>
	);
};

export default Copy;
