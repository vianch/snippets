import { ReactElement } from "react";

import IconContainer from "@/components/ui/icons/Icon";

const Strikethrough = (props: Icon): ReactElement => {
	return (
		<IconContainer viewBox="0 0 256 256" {...props}>
			<path d="M224,128a8,8,0,0,1-8,8H164.65a44,44,0,0,1-9.09,66.24C147,207.6,135.4,210,123.29,210c-19.55,0-40.36-6.24-56.13-16.71a8,8,0,1,1,8.84-13.34c19.5,12.95,44.19,17.99,60.09,12.26a28,28,0,0,0,7.87-49.19V143H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM72,88a8,8,0,0,0,8-8,20,20,0,0,1,20-20h24a20,20,0,0,1,20,20v4a8,8,0,0,0,16,0V80a36,36,0,0,0-36-36H100A36,36,0,0,0,64,80,8,8,0,0,0,72,88Z"></path>
		</IconContainer>
	);
};

export default Strikethrough;
