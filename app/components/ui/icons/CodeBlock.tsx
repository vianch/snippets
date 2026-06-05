import { ReactElement } from "react";

import IconContainer from "@/components/ui/icons/Icon";

const CodeBlock = (props: Icon): ReactElement => {
	return (
		<IconContainer viewBox="0 0 256 256" {...props}>
			<path d="M40,40H80a8,8,0,0,1,0,16H48V200H80a8,8,0,0,1,0,16H40a8,8,0,0,1-8-8V48A8,8,0,0,1,40,40ZM216,40H176a8,8,0,0,1,0,16h32V200H176a8,8,0,0,1,0,16h40a8,8,0,0,1,8-8V48A8,8,0,0,1,216,40Z"></path>
		</IconContainer>
	);
};

export default CodeBlock;
