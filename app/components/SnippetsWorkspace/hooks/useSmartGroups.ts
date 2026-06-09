import { useEffect, useState } from "react";

import { ToastType } from "@/lib/constants/toast";
import { getSmartGroups, saveSmartGroups } from "@/lib/supabase/queries";
import useToastStore from "@/lib/store/toast.store";

type UseSmartGroupsResult = {
	handleRemoveSmartGroup: (name: string) => Promise<void>;
	handleSaveSmartGroup: (name: string, query: string) => Promise<void>;
	smartGroups: SmartGroup[];
};

const useSmartGroups = (): UseSmartGroupsResult => {
	const [smartGroups, setSmartGroups] = useState<SmartGroup[]>([]);
	const { addToast } = useToastStore();

	useEffect(() => {
		getSmartGroups()
			.then((groups) => setSmartGroups(groups))
			.catch(() => setSmartGroups([]));
	}, []);

	const handleSaveSmartGroup = async (
		name: string,
		query: string
	): Promise<void> => {
		const trimmedName = name.trim();
		const trimmedQuery = query.trim();

		if (!trimmedName || !trimmedQuery) {
			return;
		}

		const filtered = smartGroups.filter(
			(group) => group.name.toLowerCase() !== trimmedName.toLowerCase()
		);
		const next = [...filtered, { name: trimmedName, query: trimmedQuery }];

		setSmartGroups(next);

		try {
			await saveSmartGroups(next);
			addToast({
				type: ToastType.Success,
				message: `Saved smart group "${trimmedName}"`,
			});
		} catch {
			setSmartGroups(smartGroups);
			addToast({
				type: ToastType.Error,
				message: "Failed to save smart group",
			});
		}
	};

	const handleRemoveSmartGroup = async (name: string): Promise<void> => {
		const next = smartGroups.filter((group) => group.name !== name);
		const previous = smartGroups;

		setSmartGroups(next);

		try {
			await saveSmartGroups(next);
		} catch {
			setSmartGroups(previous);
			addToast({
				type: ToastType.Error,
				message: "Failed to remove smart group",
			});
		}
	};

	return { handleRemoveSmartGroup, handleSaveSmartGroup, smartGroups };
};

export default useSmartGroups;
