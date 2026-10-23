import Link from "next/link";
import { notFound } from "next/navigation";

import { formatMatchDate } from "@/src/lib/formatMatchDate.ts";
import { getLeagueSchedule } from "@/src/lib/leagues/getLeagueSchedule";

import SeasonSelect from "@/app/components/SeasonSelect";
import ScoreModal from "@/app/components/ScoreModal";
import { ListOrdered, Info } from "lucide-react";

import { getLeaguePermissions } from "@/src/lib/leagues/getLeaguePermissions";

type SchedulePageProps = {
	params: Promise<{
		slug: string;
	}>;
    searchParams: Promise<{
		view?: string;
	}>;
};

export default async function SchedulePage({
	params,
    searchParams,
}: SchedulePageProps) {
	const { slug } = await params;
    const { view } = await searchParams;
	const { season: seasonSlug } = await searchParams;

	const currentView =
		view === "past" || view === "all"
			? view
			: "upcoming";

	const data = await getLeagueSchedule(slug, currentView, seasonSlug);

	if (!data) {
		notFound();
	}

	const {
		league,
		season,
		seasons,
		weeks,
	} = data;

	const permissions = season
		? await getLeaguePermissions(league.id, season.id)
		: null;

	const scheduleUrl = (view?: string) => {
		const params = new URLSearchParams();

		if (view) {
			params.set("view", view);
		}

		if (seasonSlug) {
			params.set("season", seasonSlug);
		}

		const query = params.toString();

		return `/leagues/${league.slug}/schedule${query ? `?${query}` : ""}`;
	};

	const teamUrl = (teamSlug: string) => {
		const params = new URLSearchParams();

		if (seasonSlug) {
			params.set("season", seasonSlug);
		}

		const query = params.toString();

		return `/leagues/${league.slug}/teams/${teamSlug}${query ? `?${query}` : ""}`;
	}

	return (
		<main className="mx-auto w-full max-w-7xl px-6 py-12">
			<div className="flex justify-between py-4 first:pt-0 flex-col gap-6 sm:flex-row sm:items-center">
				<div>
					<h1 className="mt-2 font-[family-name:var(--font-serif)] text-[var(--accent)] text-xl font-semibold sm:text-2xl">
						League Schedule
					</h1>

					{season && (
						<p className="mt-3 text-[var(--text-muted)]">
							{season.name} season
						</p>
					)}
				</div>
				<div>
					<SeasonSelect 
						seasons={seasons}
					    selectedSeason={season}
					/>
				</div>
			</div>

            <div className="mt-8 flex border-b border-[var(--surface-alt)]">
                <Link
                    href={scheduleUrl()}
                    className={`border-b-2 px-5 py-3 text-sm font-semibold ${
                        currentView === "upcoming"
                            ? "border-[var(--accent)] text-[var(--text)]"
                            : "border-transparent text-[var(--text-muted)] hover:text-[var(--text)]"
                    }`}
                >
                    Upcoming
                </Link>

                <Link
                    href={scheduleUrl("past")}
                    className={`border-b-2 px-5 py-3 text-sm font-semibold ${
                        currentView === "past"
                            ? "border-[var(--accent)] text-[var(--text)]"
                            : "border-transparent text-[var(--text-muted)] hover:text-[var(--text)]"
                    }`}
                >
                    Past
                </Link>

                <Link
                    href={scheduleUrl("all")}
                    className={`border-b-2 px-5 py-3 text-sm font-semibold ${
                        currentView === "all"
                            ? "border-[var(--accent)] text-[var(--text)]"
                            : "border-transparent text-[var(--text-muted)] hover:text-[var(--text)]"
                    }`}
                >
                    All
                </Link>
            </div>

			{!season ? (
				<p className="mt-10 text-[var(--text-muted)]">
					There is no active season.
				</p>
			) : (
				<div className="mt-10 space-y-8">
					{weeks.map((week) => (
						<section
							key={week.week}
							className="overflow-hidden rounded-md border border-[var(--surface-alt)] bg-[var(--surface)]"
						>
							<div className="flex flex-wrap items-end justify-between gap-3 border-b border-[var(--surface-alt)] bg-[var(--surface-alt)] px-6 py-4">
								<div>
									<p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
										Week {week.week}
									</p>

									<h2 className="mt-1 font-[family-name:var(--font-serif)] text-2xl font-semibold">
										{formatMatchDate(week.date)}
									</h2>
								</div>

								{week.byeTeam && (
									<p className="text-sm text-[var(--text-muted)]">
										Bye:{" "}
										<Link
											href={teamUrl(week.byeTeam.slug)}
											className="font-semibold text-[var(--text)] hover:text-[var(--accent)]"
										>
											{week.byeTeam.name}
										</Link>
									</p>
								)}
							</div>

							<div className="divide-y divide-[var(--surface-alt)]">
								{week.matches.map((match) => (
									<div
										key={match.id}
										className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 py-5"
									>
										<div className="flex items-center gap-5 justify-end">
											{(
												match.awayTeam.playerStatsEnabled &&
												match.status !== 'completed' &&
												permissions?.canManageLineup(match.awayTeam.id)
												) && (
												<Link
													href={`/leagues/${league.slug}/matches/${match.id}/lineup/${match.awayTeam.id}`}
													className="text-xs font-sans font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]"
													title="Lineup"
												>
													Lineup <ListOrdered
														className="size-4 inline"
													/>
												</Link>
											)}

											<Link
												href={teamUrl(match.awayTeam.slug)}
												className="text-right sm:text-lg font-semibold hover:text-[var(--accent)]"
											>
												{match.awayTeam.name}
											</Link>
										</div>

										<div className="min-w-16 text-center">
											{match.status === "completed" ? (
												<p className="bg-[var(--accent)] rounded-md px-2 py-1 sm:px-4 sm:py-2 text-[var(--surface)] font-[family-name:var(--font-mono)] sm:text-lg font-semibold">
													{match.awayScore}
													&nbsp;&ndash;&nbsp;
													{match.homeScore}
												</p>
											) : (
												<p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
													@
												</p>
											)}

										</div>

										<div className="flex items-center gap-2 flex-col sm:flex-row">
											<Link
												href={teamUrl(match.homeTeam.slug)}
												className="sm:text-lg font-semibold hover:text-[var(--accent)] order-2 sm:order-1"
											>
												{match.homeTeam.name}
											</Link>

											{(
												match.homeTeam.playerStatsEnabled &&
												match.status !== 'completed' &&
												permissions?.canManageLineup(match.homeTeam.id)
												) && (
												<Link
													href={`/leagues/${league.slug}/matches/${match.id}/lineup/${match.homeTeam.id}`}
													className="text-xs font-sans font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)] order-1 sm:order-2"
													title="Lineup"
												>
													<ListOrdered
														className="inline size-4"
													/> Lineup
												</Link>
											)}
										</div>
										
										<div
											className="text-center flex items-baseline justify-center col-span-3 gap-5"
										>
											{ (match.awayTeam.playerStatsEnabled 
												|| match.homeTeam.playerStatsEnabled) 
												&& (
												<Link
													href={`/leagues/${league.slug}/matches/${match.id}`}
													className="inline gap-1 items-center text-sm font-sans font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]"
												>
													<Info
														className="inline size-4"
													/> Details
												</Link>
											)}

											{permissions?.canManageMatch(
												match.homeTeam.id,
												match.awayTeam.id
											) && (
												<ScoreModal
													matchId={match.id}
													awayTeam={match.awayTeam}
													homeTeam={match.homeTeam}
													awayScore={match.awayScore}
													homeScore={match.homeScore}
												/>
											)}
										</div>
									</div>
								))}
							</div>
						</section>
					))}
				</div>
			)}
		</main>
	);
}