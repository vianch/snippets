"use client";

import { FC, ReactElement, useEffect } from "react";

/* Lib */
import { ServiceWorkerPath } from "@/lib/constants/pwa.constants";

const ServiceWorkerRegister: FC = (): ReactElement | null => {
	useEffect(() => {
		if (!("serviceWorker" in navigator)) {
			return;
		}

		navigator.serviceWorker.register(ServiceWorkerPath).catch(() => undefined);
	}, []);

	return null;
};

export default ServiceWorkerRegister;
