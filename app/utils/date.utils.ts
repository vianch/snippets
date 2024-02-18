const formatDateToDDMMYYYY = (dateString: string): string => {
	if (dateString) {
		const date = new Date(dateString);
		const today = new Date();
		const day = date.getDate().toString().padStart(2, "0");
		const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-indexed
		const year = date.getFullYear();
		const hours = date.getHours().toString().padStart(2, "0");
		const minutes = date.getMinutes().toString().padStart(2, "0");

		if (date.setHours(0, 0, 0, 0) === today.setHours(0, 0, 0, 0)) {
			return `${hours}:${minutes}`;
		}

		return `${day}/${month}/${year}`;
	}

	return "";
};

export default formatDateToDDMMYYYY;
