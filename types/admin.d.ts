import { AppRole } from "@/lib/constants/roles";

declare global {
	// A user as presented in the admin dashboard. Assembled server-side from the
	// Supabase Admin API (auth.users) + the user_roles table.
	interface AdminUser {
		createdAt: string;
		email: string;
		id: string;
		isDemo: boolean;
		isDisabled: boolean;
		lastSignInAt: string | null;
		role: AppRole;
		theme: string;
		username: string;
	}

	type AdminUsersResponse = {
		total: number;
		users: AdminUser[];
	};

	type AdminUserCreatePayload = {
		email: string;
		password: string;
		role?: AppRole;
		theme?: string;
		username?: string;
	};

	type AdminUserUpdatePayload = {
		email?: string;
		isDisabled?: boolean;
		role?: AppRole;
		theme?: string;
		username?: string;
	};

	// Flat form state shared between the user form modal and its container.
	type AdminUserFormValues = {
		email: string;
		isDisabled: boolean;
		password: string;
		role: AppRole;
		theme: string;
		username: string;
	};

	// Generic shape consumed by the chart primitives.
	type ChartDatum = {
		color?: string;
		label: string;
		value: number;
	};

	// Projection of the `snippet` table used by the analytics aggregator.
	type AnalyticsSnippetRow = {
		created_at: string;
		folder: string | null;
		is_public: boolean;
		language: string;
		state: string;
		tags: string | null;
		user_id: string;
	};

	type LanguageDatum = {
		count: number;
		language: string;
	};

	type ContributorDatum = {
		count: number;
		email: string;
		userId: string;
	};

	type SnippetTrendPoint = {
		count: number;
		label: string;
	};

	type TagDatum = {
		count: number;
		tag: string;
	};

	type FolderDatum = {
		count: number;
		folder: string;
	};

	type SavedSearchDatum = {
		count: number;
		name: string;
	};

	interface SnippetAnalytics {
		activeUsers: number;
		averagePerUser: number;
		dailyTrend: SnippetTrendPoint[];
		favoriteCount: number;
		folderCount: number;
		folderDistribution: FolderDatum[];
		generatedAt: string;
		languageDistribution: LanguageDatum[];
		monthlyTrend: SnippetTrendPoint[];
		mostUsedLanguage: string | null;
		newUsersLast30Days: number;
		publicCount: number;
		savedSearchCount: number;
		savedSearches: SavedSearchDatum[];
		tagDistribution: TagDatum[];
		topContributors: ContributorDatum[];
		totalSnippets: number;
		totalUsers: number;
		totalVersions: number;
		uncategorizedCount: number;
		uniqueTagCount: number;
		weeklyTrend: SnippetTrendPoint[];
	}
}

export {};
