import { demoAccountData } from "@/lib/constants/account";

/**
 *    * Checks if the user is a demo user based on their email.
 *    * A demo user is identified by a specific email address.
 *    * In this case, the demo user email is demo"
 * @param email
 * @returns boolean - true if the user is a demo user, false otherwise
 */
export const isUserEmailDemo = (email: string): boolean => {
	// Check if the user is a demo user based on their email
	return email === demoAccountData.email;
};

/**
 *
 * @param username
 * @returns boolean - true if the user is a demo user, false otherwise
 * This function checks if the provided username matches the demo user's username.
 * A demo user is identified by a specific username, which is "demo" in this case
 */
export const isUsernameDemo = (username: string): boolean => {
	// Check if the user is a demo user based on their username
	return username === demoAccountData.username;
};
