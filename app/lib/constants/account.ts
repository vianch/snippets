export const avatarImages = [
	"/assets/images/avatars/frog.png",
	"/assets/images/avatars/frog_face.png",
	"/assets/images/avatars/monkey.png",
	// "/assets/images/avatars/rat.png",
	"/assets/images/avatars/lion.png",
	"/assets/images/avatars/dog.png",
	"/assets/images/avatars/cat.png",
	"/assets/images/avatars/elephant.png",
	"/assets/images/avatars/owl.png",
	"/assets/images/avatars/dove.png",
	// "/assets/images/avatars/man.png",
	// "/assets/images/avatars/woman.png",
	"/assets/images/avatars/wizard.png",
	"/assets/images/avatars/warrior.png",
	"/assets/images/avatars/warlock.png",
	"/assets/images/avatars/rogue.png",
];

export const defaultAvatar = avatarImages[0];

export const accountInitialStateData: InitialAccountStateData = {
	email: "",
	username: "",
	currentPassword: "",
	newPassword: "",
	confirmPassword: "",
	avatar: defaultAvatar,
};

export const demoAccountData = {
	email: "demo@vianch.com",
	username: "demo",
	password: "demo",
};

export const modalCloseDelay = 1300;
