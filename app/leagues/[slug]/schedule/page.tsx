import Link from "next/link";
import { notFound } from "next/navigation";

import { formatMatchDate } from "@/src/lib/formatMatchDate.ts";
import { getLeagueSchedule } from "@/src/lib/leagues/getLeagueSchedule";

import SeasonSelect from "@/app/components/SeasonSelect";

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
			<div className="flex items-center justify-between py-4 first:pt-0">
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
										<Link
											href={teamUrl(match.awayTeam.slug)}
											className="text-right font-[family-name:var(--font-serif)] text-lg font-semibold hover:text-[var(--accent)]"
										>
											{match.awayTeam.name}
										</Link>

										<div className="min-w-16 text-center">
											{match.status === "completed" ? (
												<p className="bg-[var(--accent)] rounded-lg px-4 py-2 text-[var(--surface)] font-[family-name:var(--font-mono)] text-lg font-semibold">
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

										<Link
											href={teamUrl(match.homeTeam.slug)}
											className="font-[family-name:var(--font-serif)] text-lg font-semibold hover:text-[var(--accent)]"
										>
											{match.homeTeam.name}
										</Link>
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