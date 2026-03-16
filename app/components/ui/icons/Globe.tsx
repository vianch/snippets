import { ReactElement } from "react";

import IconContainer from "@/components/ui/icons/Icon";

const Globe = (props: Icon): ReactElement => {
	return (
		<IconContainer {...props} viewBox="0 0 24 24">
			<circle
				cx="12"
				cy="12"
				r="10"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
			/>
			<ellipse
				cx="12"
				cy="12"
				rx="4"
				ry="10"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
			/>
			<path d="M2 12h20" fill="none" stroke="currentColor" strokeWidth="1.5" />
		</IconContainer>
	);
};

export default Globe;
