import { ReactElement } from "react";

import IconContainer from "@/components/ui/icons/Icon";

const Keyboard = (props: Icon): ReactElement => {
	return (
		<IconContainer viewBox="0 0 256 256" {...props}>
			<path d="M224,64H32A16,16,0,0,0,16,80V176a16,16,0,0,0,16,16H224a16,16,0,0,0,16-16V80A16,16,0,0,0,224,64Zm0,112H32V80H224V176ZM48,116a8,8,0,0,1,8-8H64a8,8,0,0,1,0,16H56A8,8,0,0,1,48,116Zm40,0a8,8,0,0,1,8-8h8a8,8,0,0,1,0,16H96A8,8,0,0,1,88,116Zm40,0a8,8,0,0,1,8-8h8a8,8,0,0,1,0,16h-8A8,8,0,0,1,128,116Zm40,0a8,8,0,0,1,8-8h24a8,8,0,0,1,0,16H176A8,8,0,0,1,168,116ZM48,148a8,8,0,0,1,8-8h8a8,8,0,0,1,0,16H56A8,8,0,0,1,48,148Zm40,0a8,8,0,0,1,8-8h64a8,8,0,0,1,0,16H96A8,8,0,0,1,88,148Zm88,0a8,8,0,0,1,8-8h16a8,8,0,0,1,0,16H184A8,8,0,0,1,176,148Z"></path>
		</IconContainer>
	);
};

export default Keyboard;
