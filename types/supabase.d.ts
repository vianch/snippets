interface InitialAccountStateData {
	email?: string;
	username?: string;
	currentPassword: string;
	newPassword?: string;
	confirmPassword?: string;
	avatar?: string;
}
interface User {
	id: string;
	app_metadata?: unknown;
	user_metadata?: {
		username?: string;
		avatar?: string;
	};
	aud: string;
	confirmation_sent_at?: string;
	recovery_sent_at?: string;
	email_change_sent_at?: string;
	new_email?: string;
	new_phone?: string;
	invited_at?: string;
	action_link?: string;
	email?: string;
	phone?: string;
	created_at: string;
	confirmed_at?: string;
	email_confirmed_at?: string;
	phone_confirmed_at?: string;
	last_sign_in_at?: string;
	role?: string;
	updated_at?: string;
	identities?: unknown[];
	factors?: unknown[];
}

interface SessionData {
	user: User;
	expires_at: string;
	refresh_token: string;
	access_token: string;
	token_type: string;
}

type Session = SessionData | null;
