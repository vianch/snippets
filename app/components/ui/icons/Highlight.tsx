import { ReactElement } from "react";

import IconContainer from "@/components/ui/icons/Icon";

const Highlight = (props: Icon): ReactElement => {
	return (
		<IconContainer viewBox="0 0 256 256" {...props}>
			<path d="M231.4,44.5l-20-12a16.1,16.1,0,0,0-19.4,2.6l-93.3,93.4L88,120a8,8,0,0,0-10.9.4l-32,32a8,8,0,0,0,0,11.3l39.2,39.2v24.6a8,8,0,0,0,13.7,5.6l32-32A8,8,0,0,0,132,190.9l-8.5-10.7,93.4-93.3a16.1,16.1,0,0,0,2.6-19.4ZM88,207l-16-16v-13.4l16,16Zm-25.4-46.7L88.7,134.2l25.1,25.1L87.7,185.4ZM211.4,66,118,159.4,96.6,138,190,44.6Z"></path>
		</IconContainer>
	);
};

export default Highlight;
