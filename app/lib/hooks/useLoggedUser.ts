"use client";

import { useEffect, useState } from "react";

/* Lib */
import { getUserIdBySession } from "@/lib/supabase/userQueries";

const useLoggedUser = (): LoggedUser => {
	const [hasResolvedSession, setHasResolvedSession] = useState<boolean>(false);
	const [userId, setUserId] = useState<UUID | null>(null);

	useEffect(() => {
		getUserIdBySession()
			.then((sessionUserId) => {
				// Supabase auth user ids are UUID strings.
				setUserId(sessionUserId as UUID | null);
			})
			.finally(() => {
				setHasResolvedSession(true);
			});
	}, []);

	return { hasResolvedSession, isLogged: Boolean(userId), userId };
};

export default useLoggedUser;
