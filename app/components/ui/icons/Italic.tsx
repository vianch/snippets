import { ReactElement } from "react";

import IconContainer from "@/components/ui/icons/Icon";

const Italic = (props: Icon): ReactElement => {
	return (
		<IconContainer viewBox="0 0 256 256" {...props}>
			<path d="M200,56a8,8,0,0,1-8,8H157.77L115.1,192H144a8,8,0,0,1,0,16H64a8,8,0,0,1,0-16H98.23L140.9,64H112a8,8,0,0,1,0-16h80A8,8,0,0,1,200,56Z"></path>
		</IconContainer>
	);
};

export default Italic;
