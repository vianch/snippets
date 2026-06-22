"use client";

import { ReactElement, useCallback, useEffect, useState } from "react";

/* Constants */
import {
	AdminApiPaths,
	ChartPalette,
	RequestStatus,
	TrendPeriod,
} from "@/lib/constants/admin.constants";
import { ToastType } from "@/lib/constants/toast";

/* Components */
import AnalyticsSkeleton from "@/components/admin/SnippetAnalytics/AnalyticsSkeleton";
import AreaChart from "@/components/admin/charts/AreaChart/AreaChart";
import BarChart from "@/components/admin/charts/BarChart/BarChart";
import DonutChart from "@/components/admin/charts/DonutChart/DonutChart";
import StatCard from "@/components/admin/StatCard/StatCard";
import Alert from "@/components/ui/Alert/Alert";
import Button from "@/components/ui/Button/Button";
import Card from "@/components/ui/Card/Card";
import CodeBlock from "@/components/ui/icons/CodeBlock";
import Floppy from "@/components/ui/icons/Floppy";
import Folder from "@/components/ui/icons/Folder";
import Globe from "@/components/ui/icons/Globe";
import ListChecks from "@/components/ui/icons/ListChecks";
import ListNumbers from "@/components/ui/icons/ListNumbers";
import MagnifyingGlass from "@/components/ui/icons/MagnifyingGlass";
import Sparkle from "@/components/ui/icons/Sparkle";
import StarFilled from "@/components/ui/icons/StarFilled";
import Tag from "@/components/ui/icons/Tag";
import User from "@/components/ui/icons/User";

/* Lib */
import useToastStore from "@/lib/store/toast.store";

/* Styles */
import styles from "./snippetAnalytics.module.css";

type StatCardConfig = {
	accentVar: string;
	decimals?: number;
	footnote?: string;
	footnoteTone?: "down" | "muted" | "up";
	icon: ReactElement;
	label: string;
	value: number;
};

const SnippetAnalytics = (): ReactElement => {
	const { addToast } = useToastStore();
	const [analytics, setAnalytics] = useState<SnippetAnalytics | null>(null);
	const [status, setStatus] = useState<RequestStatus>(RequestStatus.Loading);
	const [period, setPeriod] = useState<TrendPeriod>(TrendPeriod.Daily);

	const loadAnalytics = useCallback(async (): Promise<void> => {
		setStatus(RequestStatus.Loading);

		try {
			const response = await fetch(AdminApiPaths.analytics);

			if (!response.ok) {
				throw new Error("Failed to load analytics");
			}

			const data = (await response.json()) as SnippetAnalytics;

			setAnalytics(data);
			setStatus(RequestStatus.Ready);
		} catch {
			setStatus(RequestStatus.Error);
			addToast({ message: "Could not load analytics", type: ToastType.Error });
		}
	}, [addToast]);

	useEffect(() => {
		loadAnalytics();
	}, [loadAnalytics]);

	if (status === RequestStatus.Loading) {
		return <AnalyticsSkeleton />;
	}

	if (status === RequestStatus.Error || !analytics) {
		return (
			<Alert severity="error">
				<div className={styles.errorRow}>
					<span>Could not load analytics.</span>
					<Button variant="secondary" onClick={loadAnalytics}>
						Retry
					</Button>
				</div>
			</Alert>
		);
	}

	const cards: StatCardConfig[] = [
		{
			accentVar: "--purple-color",
			footnote: `${analytics.publicCount} public`,
			icon: <CodeBlock width={18} height={18} />,
			label: "Total snippets",
			value: analytics.totalSnippets,
		},
		{
			accentVar: "--cyan-color",
			footnote:
				analytics.newUsersLast30Days > 0
					? `+${analytics.newUsersLast30Days} in 30d`
					: "No new signups",
			footnoteTone: analytics.newUsersLast30Days > 0 ? "up" : "muted",
			icon: <User width={18} height={18} />,
			label: "Total users",
			value: analytics.totalUsers,
		},
		{
			accentVar: "--green-color",
			footnote: "with snippets",
			icon: <ListChecks width={18} height={18} />,
			label: "Active users",
			value: analytics.activeUsers,
		},
		{
			accentVar: "--yellow-color",
			icon: <StarFilled width={18} height={18} />,
			label: "Favorites",
			value: analytics.favoriteCount,
		},
		{
			accentVar: "--blue-color",
			icon: <Globe width={18} height={18} />,
			label: "Public snippets",
			value: analytics.publicCount,
		},
		{
			accentVar: "--orange-color",
			decimals: 1,
			footnote: "snippets / user",
			icon: <ListNumbers width={18} height={18} />,
			label: "Average per user",
			value: analytics.averagePerUser,
		},
		{
			accentVar: "--purple-color",
			footnote: `${analytics.uncategorizedCount} untagged`,
			icon: <Tag width={18} height={18} />,
			label: "Tags in use",
			value: analytics.uniqueTagCount,
		},
		{
			accentVar: "--cyan-color",
			icon: <Folder width={18} height={18} />,
			label: "Folders",
			value: analytics.folderCount,
		},
		{
			accentVar: "--green-color",
			icon: <MagnifyingGlass width={18} height={18} />,
			label: "Saved searches",
			value: analytics.savedSearchCount,
		},
		{
			accentVar: "--orange-color",
			footnote: "total edits",
			icon: <Floppy width={18} height={18} />,
			label: "Snippet versions",
			value: analytics.totalVersions,
		},
		{
			accentVar: "--comment-color",
			footnote: "last 30 days",
			footnoteTone: analytics.newUsersLast30Days > 0 ? "up" : "muted",
			icon: <Sparkle width={18} height={18} />,
			label: "New users",
			value: analytics.newUsersLast30Days,
		},
	];
	const languageData: ChartDatum[] = analytics.languageDistribution.map(
		(item) => ({ label: item.language, value: item.count })
	);
	const tagData: ChartDatum[] = analytics.tagDistribution.map((item) => ({
		label: item.tag,
		value: item.count,
	}));
	const trendByPeriod: Record<TrendPeriod, SnippetTrendPoint[]> = {
		[TrendPeriod.Daily]: analytics.dailyTrend,
		[TrendPeriod.Monthly]: analytics.monthlyTrend,
		[TrendPeriod.Weekly]: analytics.weeklyTrend,
	};
	const topContributorMax = analytics.topContributors[0]?.count ?? 1;
	const folderMax = analytics.folderDistribution[0]?.count ?? 1;
	const savedSearchMax = analytics.savedSearches[0]?.count ?? 1;
	const trendPeriods: { label: string; value: TrendPeriod }[] = [
		{ label: "Daily", value: TrendPeriod.Daily },
		{ label: "Weekly", value: TrendPeriod.Weekly },
		{ label: "Monthly", value: TrendPeriod.Monthly },
	];

	return (
		<div className={styles.container}>
			<div className={styles.grid}>
				{cards.map((card, index) => (
					<StatCard
						key={card.label}
						accentVar={card.accentVar}
						decimals={card.decimals ?? 0}
						delayMs={index * 60}
						icon={card.icon}
						label={card.label}
						value={card.value}
						{...(card.footnote ? { footnote: card.footnote } : {})}
						{...(card.footnoteTone ? { footnoteTone: card.footnoteTone } : {})}
					/>
				))}
			</div>

			<div className={styles.panelRow}>
				<Card
					title="Creation trend"
					subtitle="Snippets created over time"
					actions={
						<div className={styles.toggle} role="tablist">
							{trendPeriods.map((option) => (
								<Button
									key={option.value}
									variant={period === option.value ? "primary" : "secondary"}
									role="tab"
									aria-selected={period === option.value}
									onClick={() => setPeriod(option.value)}
								>
									{option.label}
								</Button>
							))}
						</div>
					}
				>
					{analytics.totalSnippets > 0 ? (
						<AreaChart data={trendByPeriod[period]} />
					) : (
						<p className={styles.emptyNote}>No activity recorded yet.</p>
					)}
				</Card>

				<Card
					title="Language mix"
					subtitle={`Top: ${analytics.mostUsedLanguage ?? "—"}`}
				>
					{languageData.length > 0 ? (
						<DonutChart
							data={languageData}
							centerValue={String(languageData.length)}
							centerLabel="languages"
						/>
					) : (
						<p className={styles.emptyNote}>No languages yet.</p>
					)}
				</Card>
			</div>

			<div className={styles.panelRow}>
				<Card title="Top languages" subtitle="Snippets per language">
					{languageData.length > 0 ? (
						<BarChart data={languageData} />
					) : (
						<p className={styles.emptyNote}>No languages yet.</p>
					)}
				</Card>

				<Card title="Top contributors" subtitle="Most active users">
					{analytics.topContributors.length > 0 ? (
						<ul className={styles.rankList}>
							{analytics.topContributors.map((contributor, index) => {
								const accentVar = ChartPalette[index % ChartPalette.length];
								const widthPercent =
									(contributor.count / Math.max(1, topContributorMax)) * 100;

								return (
									<li className={styles.rankItem} key={contributor.userId}>
										<span
											className={styles.rankLabel}
											title={contributor.email}
										>
											{contributor.email}
										</span>
										<span className={styles.rankTrack}>
											<span
												className={styles.rankBar}
												style={{
													background: `var(${accentVar ?? "--purple-color"})`,
													width: `${widthPercent}%`,
												}}
											/>
										</span>
										<span className={styles.rankValue}>
											{contributor.count}
										</span>
									</li>
								);
							})}
						</ul>
					) : (
						<p className={styles.emptyNote}>No contributors yet.</p>
					)}
				</Card>
			</div>

			<div className={styles.panelRow}>
				<Card title="Top folders" subtitle="Snippets per folder">
					{analytics.folderDistribution.length > 0 ? (
						<ul className={styles.rankList}>
							{analytics.folderDistribution.map((entry, index) => {
								const accentVar = ChartPalette[index % ChartPalette.length];
								const widthPercent =
									(entry.count / Math.max(1, folderMax)) * 100;

								return (
									<li className={styles.rankItem} key={entry.folder}>
										<span className={styles.rankLabel} title={entry.folder}>
											{entry.folder}
										</span>
										<span className={styles.rankTrack}>
											<span
												className={styles.rankBar}
												style={{
													background: `var(${accentVar ?? "--purple-color"})`,
													width: `${widthPercent}%`,
												}}
											/>
										</span>
										<span className={styles.rankValue}>{entry.count}</span>
									</li>
								);
							})}
						</ul>
					) : (
						<p className={styles.emptyNote}>No folders yet.</p>
					)}
				</Card>

				<Card title="Saved searches" subtitle="Popular smart groups">
					{analytics.savedSearches.length > 0 ? (
						<ul className={styles.rankList}>
							{analytics.savedSearches.map((entry, index) => {
								const accentVar = ChartPalette[index % ChartPalette.length];
								const widthPercent =
									(entry.count / Math.max(1, savedSearchMax)) * 100;

								return (
									<li className={styles.rankItem} key={entry.name}>
										<span className={styles.rankLabel} title={entry.name}>
											{entry.name}
										</span>
										<span className={styles.rankTrack}>
											<span
												className={styles.rankBar}
												style={{
													background: `var(${accentVar ?? "--purple-color"})`,
													width: `${widthPercent}%`,
												}}
											/>
										</span>
										<span className={styles.rankValue}>{entry.count}</span>
									</li>
								);
							})}
						</ul>
					) : (
						<p className={styles.emptyNote}>No saved searches yet.</p>
					)}
				</Card>
			</div>

			<Card title="Top tags" subtitle="Most-used tags across snippets">
				{tagData.length > 0 ? (
					<BarChart data={tagData} />
				) : (
					<p className={styles.emptyNote}>No tags yet.</p>
				)}
			</Card>
		</div>
	);
};

export default SnippetAnalytics;
