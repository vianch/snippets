import {
	AnalyticsSnippetLimit,
	LanguageDistributionLimit,
	TopContributorsLimit,
	TopFoldersLimit,
	TopSavedSearchesLimit,
	TopTagsLimit,
	TrendDays,
	TrendMonths,
	TrendWeeks,
	UsersPerPage,
} from "@/lib/constants/admin.constants";
import { SnippetState } from "@/lib/constants/core";
import {
	MillisecondsPerDay,
	ShortMonthNames,
} from "@/lib/constants/date.constants";
import createSupabaseAdminClient from "@/lib/supabase/admin";

import { dayKey } from "@/utils/date.utils";

const countBy = <Item>(
	items: Item[],
	keyOf: (item: Item) => string
): Map<string, number> => {
	const counts = new Map<string, number>();

	items.forEach((item) => {
		const key = keyOf(item);

		counts.set(key, (counts.get(key) ?? 0) + 1);
	});

	return counts;
};

const buildDailyTrend = (
	snippets: AnalyticsSnippetRow[]
): SnippetTrendPoint[] => {
	const counts = countBy(snippets, (snippet) => dayKey(snippet.created_at));

	return Array.from({ length: TrendDays }, (_, index) => {
		const date = new Date();

		date.setDate(date.getDate() - (TrendDays - 1 - index));

		const key = date.toISOString().slice(0, 10);
		const month = Number(key.slice(5, 7)) - 1;
		const day = Number(key.slice(8, 10));

		return {
			count: counts.get(key) ?? 0,
			label: `${ShortMonthNames[month] ?? ""} ${day}`,
		};
	});
};

const buildWeeklyTrend = (
	snippets: AnalyticsSnippetRow[]
): SnippetTrendPoint[] => {
	const now = Date.now();

	return Array.from({ length: TrendWeeks }, (_, index) => {
		const weeksAgo = TrendWeeks - 1 - index;
		const windowStart = now - (weeksAgo + 1) * 7 * MillisecondsPerDay;
		const windowEnd = now - weeksAgo * 7 * MillisecondsPerDay;
		const count = snippets.filter((snippet) => {
			const created = new Date(snippet.created_at).getTime();

			return created >= windowStart && created < windowEnd;
		}).length;
		const startDate = new Date(windowStart);

		return {
			count,
			label: `${ShortMonthNames[startDate.getMonth()] ?? ""} ${startDate.getDate()}`,
		};
	});
};

const buildMonthlyTrend = (
	snippets: AnalyticsSnippetRow[]
): SnippetTrendPoint[] => {
	return Array.from({ length: TrendMonths }, (_, index) => {
		const monthsAgo = TrendMonths - 1 - index;
		const cursor = new Date();

		cursor.setDate(1);
		cursor.setMonth(cursor.getMonth() - monthsAgo);

		const year = cursor.getFullYear();
		const month = cursor.getMonth();
		const count = snippets.filter((snippet) => {
			const created = new Date(snippet.created_at);

			return created.getFullYear() === year && created.getMonth() === month;
		}).length;

		return { count, label: ShortMonthNames[month] ?? "" };
	});
};

const splitTags = (tags: string | null): string[] =>
	(tags ?? "")
		.split(",")
		.map((tag) => tag.trim())
		.filter(Boolean);

// Aggregates snippet + user data into the dashboard analytics payload. Runs with
// the service-role client so it sees every user's data (bypassing RLS). Done in
// memory over a bounded fetch — fine at this app's scale; a SQL view/RPC would
// be the move if the table grows into the millions.
export const computeSnippetAnalytics = async (): Promise<SnippetAnalytics> => {
	const admin = createSupabaseAdminClient();
	const { data: snippetRows } = await admin
		.from("snippet")
		.select("user_id, language, state, created_at, is_public, tags, folder")
		.order("created_at", { ascending: false })
		.limit(AnalyticsSnippetLimit);
	// Supabase rows are loosely typed; we know the selected projection.
	const allSnippets = (snippetRows ?? []) as AnalyticsSnippetRow[];
	const liveSnippets = allSnippets.filter(
		(snippet) => snippet.state !== SnippetState.Inactive
	);

	const { data: usersData } = await admin.auth.admin.listUsers({
		page: 1,
		perPage: UsersPerPage,
	});
	const allUsers = usersData?.users ?? [];
	const emailById = new Map(
		allUsers.map((user) => [user.id, user.email ?? "unknown"])
	);

	const { count: versionCount } = await admin
		.from("snippet_version")
		.select("version_id", { count: "exact", head: true });

	const totalSnippets = liveSnippets.length;
	const totalUsers = allUsers.length;
	const favoriteCount = liveSnippets.filter(
		(snippet) => snippet.state === SnippetState.Favorite
	).length;
	const publicCount = liveSnippets.filter(
		(snippet) => snippet.is_public
	).length;

	const languageCounts = countBy(
		liveSnippets,
		(snippet) => snippet.language || "unknown"
	);
	const languageDistribution: LanguageDatum[] = Array.from(
		languageCounts.entries()
	)
		.map(([language, count]) => ({ count, language }))
		.sort((first, second) => second.count - first.count)
		.slice(0, LanguageDistributionLimit);

	const perUserCounts = countBy(liveSnippets, (snippet) => snippet.user_id);
	const topContributors: ContributorDatum[] = Array.from(
		perUserCounts.entries()
	)
		.map(([userId, count]) => ({
			count,
			email: emailById.get(userId) ?? "unknown",
			userId,
		}))
		.sort((first, second) => second.count - first.count)
		.slice(0, TopContributorsLimit);

	const tagCounts = new Map<string, number>();

	liveSnippets.forEach((snippet) => {
		splitTags(snippet.tags).forEach((tag) =>
			tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1)
		);
	});

	const tagDistribution: TagDatum[] = Array.from(tagCounts.entries())
		.map(([tag, count]) => ({ count, tag }))
		.sort((first, second) => second.count - first.count)
		.slice(0, TopTagsLimit);
	const uncategorizedCount = liveSnippets.filter(
		(snippet) => splitTags(snippet.tags).length === 0
	).length;

	const folderCounts = countBy(
		liveSnippets.filter((snippet) => (snippet.folder ?? "").trim().length > 0),
		(snippet) => (snippet.folder ?? "").trim()
	);
	const folderDistribution: FolderDatum[] = Array.from(folderCounts.entries())
		.map(([folder, count]) => ({ count, folder }))
		.sort((first, second) => second.count - first.count)
		.slice(0, TopFoldersLimit);

	// Saved searches live on each user's metadata as `smart_groups`.
	const savedSearchNames = allUsers.flatMap((user) => {
		// user_metadata is loosely typed by GoTrue.
		const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
		const groups = metadata.smart_groups;

		if (!Array.isArray(groups)) {
			return [];
		}

		return groups
			.filter(
				(group): group is SmartGroup =>
					Boolean(group) &&
					typeof group === "object" &&
					typeof (group as SmartGroup).name === "string"
			)
			.map((group) => group.name);
	});
	const savedSearchCounts = countBy(savedSearchNames, (name) => name);
	const savedSearches: SavedSearchDatum[] = Array.from(
		savedSearchCounts.entries()
	)
		.map(([name, count]) => ({ count, name }))
		.sort((first, second) => second.count - first.count)
		.slice(0, TopSavedSearchesLimit);

	const thirtyDaysAgo = Date.now() - 30 * MillisecondsPerDay;
	const newUsersLast30Days = allUsers.filter(
		(user) => new Date(user.created_at).getTime() >= thirtyDaysAgo
	).length;

	return {
		activeUsers: perUserCounts.size,
		averagePerUser:
			totalUsers > 0 ? Math.round((totalSnippets / totalUsers) * 10) / 10 : 0,
		dailyTrend: buildDailyTrend(liveSnippets),
		favoriteCount,
		folderCount: folderCounts.size,
		folderDistribution,
		generatedAt: new Date().toISOString(),
		languageDistribution,
		monthlyTrend: buildMonthlyTrend(liveSnippets),
		mostUsedLanguage: languageDistribution[0]?.language ?? null,
		newUsersLast30Days,
		publicCount,
		savedSearchCount: savedSearchNames.length,
		savedSearches,
		tagDistribution,
		topContributors,
		totalSnippets,
		totalUsers,
		totalVersions: versionCount ?? 0,
		uncategorizedCount,
		uniqueTagCount: tagCounts.size,
		weeklyTrend: buildWeeklyTrend(liveSnippets),
	};
};
