import Link from "next/link";
import { notFound } from "next/navigation";

import { getLeagueSchedule } from "@/src/lib/leagues/getLeagueSchedule";

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

	const currentView =
		view === "past" || view === "all"
			? view
			: "upcoming";

	const data = await getLeagueSchedule(slug, currentView);

	if (!data) {
		notFound();
	}

	const {
		league,
		season,
		weeks,
	} = data;

	return (
		<main className="mx-auto w-full max-w-7xl px-6 py-12">
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

            <div className="mt-8 flex border-b border-[var(--surface-alt)]">
                <Link
                    href={`/leagues/${league.slug}/schedule`}
                    className={`border-b-2 px-5 py-3 text-sm font-semibold ${
                        currentView === "upcoming"
                            ? "border-[var(--accent)] text-[var(--text)]"
                            : "border-transparent text-[var(--text-muted)] hover:text-[var(--text)]"
                    }`}
                >
                    Upcoming
                </Link>

                <Link
                    href={`/leagues/${league.slug}/schedule?view=past`}
                    className={`border-b-2 px-5 py-3 text-sm font-semibold ${
                        currentView === "past"
                            ? "border-[var(--accent)] text-[var(--text)]"
                            : "border-transparent text-[var(--text-muted)] hover:text-[var(--text)]"
                    }`}
                >
                    Past
                </Link>

                <Link
                    href={`/leagues/${league.slug}/schedule?view=all`}
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
										{new Intl.DateTimeFormat(
											"en-US",
											{
												weekday: "long",
												month: "long",
												day: "numeric",
											}
										).format(
											new Date(week.date)
										)}
									</h2>
								</div>

								{week.byeTeam && (
									<p className="text-sm text-[var(--text-muted)]">
										Bye:{" "}
										<Link
											href={`/leagues/${league.slug}/teams/${week.byeTeam.slug}`}
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
											href={`/leagues/${league.slug}/teams/${match.awayTeam.slug}`}
											className="text-right font-[family-name:var(--font-serif)] text-lg font-semibold hover:text-[var(--accent)]"
										>
											{match.awayTeam.name}
										</Link>

										<div className="min-w-16 text-center">
											{match.status === "completed" ? (
												<p className="font-[family-name:var(--font-mono)] text-lg font-semibold">
													{match.awayScore}
													{" – "}
													{match.homeScore}
												</p>
											) : (
												<p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
													at
												</p>
											)}
										</div>

										<Link
											href={`/leagues/${league.slug}/teams/${match.homeTeam.slug}`}
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