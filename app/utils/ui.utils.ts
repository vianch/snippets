const isClient = (): boolean => {
	return typeof window !== "undefined";
};

export default isClient;
