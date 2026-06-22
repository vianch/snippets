"use client";

import { useEffect } from "react";

/* Constants */
import { AppRole } from "@/lib/constants/roles";

/* Lib */
import useUserStore from "@/lib/store/user.store";
import {
	getCurrentUserRole,
	getUserEmailBySession,
} from "@/lib/supabase/queries";

type CurrentUser = {
	email: string | null;
	isAdmin: boolean;
};

// Loads the signed-in user's role and email into the user store and returns
// them. Centralizes the role/identity wiring so the sidebar menu and the admin
// dashboard don't each fetch it inline.
const useCurrentUser = (): CurrentUser => {
	const email = useUserStore((state) => state.email);
	const isAdmin = useUserStore((state) => state.isAdmin);
	const setEmail = useUserStore((state) => state.setEmail);
	const setIsAdmin = useUserStore((state) => state.setIsAdmin);

	useEffect(() => {
		getCurrentUserRole().then((role) => {
			setIsAdmin(role === AppRole.Admin);
		});
	}, [setIsAdmin]);

	useEffect(() => {
		if (email) {
			return;
		}

		getUserEmailBySession().then((value) => {
			if (value) {
				setEmail(value);
			}
		});
	}, [email, setEmail]);

	return { email, isAdmin };
};

export default useCurrentUser;
