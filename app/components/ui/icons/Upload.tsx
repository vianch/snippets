import { ReactElement } from "react";

import IconContainer from "@/components/ui/icons/Icon";

const Upload = (props: Icon): ReactElement => {
	return (
		<IconContainer viewBox="0 0 256 256" {...props}>
			<path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216ZM82.34,141.66a8,8,0,0,1,0-11.32l40-40a8,8,0,0,1,11.32,0l40,40a8,8,0,0,1-11.32,11.32L136,113.66V184a8,8,0,0,1-16,0V113.66L93.66,141.66A8,8,0,0,1,82.34,141.66Z"></path>
		</IconContainer>
	);
};

export default Upload;
