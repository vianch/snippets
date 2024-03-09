import { useEffect } from "react";
import useViewPortStore from "@/lib/store/viewPort";

export const isClient = (): boolean => {
	return typeof window !== "undefined";
};

export const useDeviceViewPort = (): void => {
	const setIsMobile = useViewPortStore((state) => state.setIsMobile);

	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth < 1140); // Adjust the width threshold as needed
		};

		window.addEventListener("resize", handleResize);
		handleResize(); // Initial check

		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, [setIsMobile]);
};
