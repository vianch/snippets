import { ReactElement } from "react";

import IconContainer from "@/components/ui/icons/Icon";

const Sparkle = (props: Icon): ReactElement => {
	return (
		<IconContainer {...props} viewBox="0 0 256 256">
			<path d="M197.58,129.06,146,110,127,58.44a8,8,0,0,0-15.06,0L93.94,110,42.42,129.06a8,8,0,0,0,0,15.08L94,163.06l19.08,51.62a8,8,0,0,0,15.06,0L147.06,163l51.52-18.92a8,8,0,0,0,0-15.08ZM136.5,148.18a8,8,0,0,0-4.82,4.82L119.5,184.48l-12.18-31.48a8,8,0,0,0-4.82-4.82L71,136.5l31.48-12.18a8,8,0,0,0,4.82-4.82L119.5,88.22l12.18,31.28a8,8,0,0,0,4.82,4.82L168,136.5ZM216,40a8,8,0,0,0-8,8V64H192a8,8,0,0,0,0,16h16V96a8,8,0,0,0,16,0V80h16a8,8,0,0,0,0-16H224V48A8,8,0,0,0,216,40Z"></path>
		</IconContainer>
	);
};

export default Sparkle;
