// Constants for the admin panel: API paths, GoTrue ban durations, analytics
// window sizes, and UI tab/filter identifiers.

export const enum AdminTab {
	Analytics = "analytics",
	Users = "users",
}

export const enum AdminFormMode {
	Create = "create",
	Edit = "edit",
}

export const JsonHeaders = { "Content-Type": "application/json" } as const;

export const enum AdminUserFilter {
	Admins = "admins",
	All = "all",
	Disabled = "disabled",
	Users = "users",
}

export const enum RequestStatus {
	Error = "error",
	Loading = "loading",
	Ready = "ready",
}

export const enum TrendPeriod {
	Daily = "daily",
	Monthly = "monthly",
	Weekly = "weekly",
}

// GoTrue treats a far-future ban as an indefinite disable; "none" lifts it.
export const BanDuration = "876000h";

export const UnbanDuration = "none";

// listUsers caps page size; one page is plenty for this app's scale.
export const UsersPerPage = 1000;

// Bound the analytics scan so a runaway table can't blow up the request.
export const AnalyticsSnippetLimit = 5000;

export const TrendDays = 30;

export const TrendWeeks = 12;

export const TrendMonths = 12;

export const TopContributorsLimit = 5;

export const LanguageDistributionLimit = 8;

export const TopTagsLimit = 10;

export const TopFoldersLimit = 8;

export const TopSavedSearchesLimit = 8;

export const MinPasswordLength = 6;

export const AdminApiPaths = {
	analytics: "/api/admin/analytics",
	users: "/api/admin/users",
} as const;

// CSS custom-property names cycled through by the charts so every series tracks
// the active theme. Authored as token names, applied via var(--token).
export const ChartPalette = [
	"--purple-color",
	"--cyan-color",
	"--green-color",
	"--orange-color",
	"--blue-color",
	"--yellow-color",
	"--red-color",
	"--comment-color",
] as const;
