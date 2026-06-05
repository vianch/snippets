import { ReactElement } from "react";

import IconContainer from "@/components/ui/icons/Icon";

const Heading = (props: Icon): ReactElement => {
	return (
		<IconContainer viewBox="0 0 256 256" {...props}>
			<path d="M208,56V200a8,8,0,0,1-16,0V136H64v64a8,8,0,0,1-16,0V56a8,8,0,0,1,16,0v64H192V56a8,8,0,0,1,16,0Z"></path>
		</IconContainer>
	);
};

export default Heading;
