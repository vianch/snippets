import { ReactElement } from "react";

import IconContainer from "@/components/ui/icons/Icon";

const Quote = (props: Icon): ReactElement => {
	return (
		<IconContainer viewBox="0 0 256 256" {...props}>
			<path d="M100,56H40A16,16,0,0,0,24,72v72a16,16,0,0,0,16,16H80v16a24,24,0,0,1-24,24,8,8,0,0,0,0,16,40,40,0,0,0,40-40V72A16,16,0,0,0,100,56Zm-60,88V72h60v72Zm176-88H156a16,16,0,0,0-16,16v72a16,16,0,0,0,16,16h40v16a24,24,0,0,1-24,24,8,8,0,0,0,0,16,40,40,0,0,0,40-40V72A16,16,0,0,0,216,56Zm-60,88V72h60v72Z"></path>
		</IconContainer>
	);
};

export default Quote;
