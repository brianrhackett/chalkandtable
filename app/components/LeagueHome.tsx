import Link from "next/link";
import { db } from "@/src/prisma/db";
import { Temporal } from "@js-temporal/polyfill";
import { formatMatchDate } from "@/src/lib/formatMatchDate.ts";
import { getLeagueStandings } from "@/src/lib/leagues/getLeagueStandings";

type LeagueHomeProps = {
    league: {
		id: number;
		name: string;
		slug: string;
    };
    season: {
        id: number;
        name: string;
        slug: string;
    }
}

export default async function LeagueHome({
	league,
    season,
}: LeagueHomeProps) {

    const matches = await db.orm.public.Match
        .where({
            seasonId: season.id,
        })
        .include("homeTeam")
        .include("awayTeam")
        .all();

    const seasonTeams = await db.orm.public.SeasonTeam
        .where({
            seasonId: season.id,
        })
        .all();

    const scheduledMatches = matches
        .filter((match) => match.status === "scheduled")
        .sort(
            (a, b) => 
                Temporal.Instant.compare(
                    a.scheduledAt,
                    b.scheduledAt
                )
        );

    const completedMatches = matches
        .filter((match) => match.status === "completed")
        .sort(
            (a, b) => 
                Temporal.Instant.compare(
                    b.scheduledAt,
                    a.scheduledAt
                )
        );

    const nextMatch = scheduledMatches[0];

    const nextWeek = nextMatch?.week ?? null;

    const nextMatches = nextWeek
        ? scheduledMatches.filter(
            (match) => match.week === nextWeek
        )
        : [];

    const latestResults = completedMatches.slice(0, 5);

	const standings = await getLeagueStandings(league.slug, season.slug);
	const top4 = standings.standings.slice(0, 4);

    return (
        <main className="mx-auto w-full max-w-7xl px-6 py-12">
			<section>
				<div className="flex items-end justify-between gap-6">
					<div>
						<h1 className="mt-2 font-[family-name:var(--font-serif)] text-[var(--accent)] text-xl sm:text-2xl font-semibold">
							Next Matches
						</h1>
					</div>

					<Link
						href={`/leagues/${league.slug}/schedule`}
						className="text-sm font-semibold text-[var(--accent)]"
					>
						Full schedule &rarr;
					</Link>
				</div>

				<div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{nextMatches.length > 0 ? (
						nextMatches.map((match) => (
							<div
								key={match.id}
								className="rounded-md border border-[var(--surface-alt)] bg-[var(--surface)] p-5"
							>
								<p className="text-sm text-[var(--text-muted)]">
									{formatMatchDate(match.scheduledAt)}
								</p>

								<p className="mt-4 font-[family-name:var(--font-serif)] text-xl">
									{match.awayTeam.name}
								</p>

								<p className="my-1 text-xs uppercase tracking-wider text-[var(--text-muted)]">
									@
								</p>

								<p className="font-[family-name:var(--font-serif)] text-xl">
									{match.homeTeam.name}
								</p>
							</div>
						))
					) : (
						<p className="text-[var(--text-muted)]">
							No upcoming matches scheduled.
						</p>
					)}
				</div>
			</section>

			<div className="mt-12 grid gap-8 lg:grid-cols-2">
				<section className="rounded-md border border-[var(--surface-alt)] bg-[var(--surface)] p-6">
					<div className="flex items-center justify-between">
						<h2 className="font-[family-name:var(--font-serif)] text-2xl">
							Standings
						</h2>

						<Link
							href={`/leagues/${league.slug}/standings`}
							className="text-sm font-semibold text-[var(--accent)]"
						>
							Full standings &rarr;
						</Link>
					</div>
					<div className="mt-5 overflow-hidden">
						<div className="overflow-x-auto">
							<table className="w-full border-collapse">
								<thead>
									<tr className="border-b border-[var(--surface-alt)]">
										<th className="sticky left-0 z-20 pr-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] sm:static">
											Team
										</th>

										<th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
											W
										</th>

										<th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
											L
										</th>

										<th className="pl-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
											PCT
										</th>
									</tr>
								</thead>

								<tbody className="divide-y divide-[var(--surface-alt)]">
									{top4.map((team, index) => (
										<tr
											key={team.teamId}
											className="transition-colors hover:bg-[var(--surface-alt)]"												
										>
											<td className="sticky left-0 z-10 min-w-30 bg-[var(--surface)] pr-5 py-5 sm:static sm:bg-transparent">
												<Link
													href={`/leagues/${league.slug}/teams/${team.slug}`}
													className="text-lg font-semibold transition-colors hover:text-[var(--accent)]"
												>
													{team.name}
												</Link>
											</td>

											<td className="px-4 py-5 text-center font-[family-name:var(--font-mono)] text-sm font-semibold">
												{team.wins}
											</td>

											<td className="px-4 py-5 text-center font-[family-name:var(--font-mono)] text-sm">
												{team.losses}
											</td>

											<td className="pl-4 py-5 text-center font-[family-name:var(--font-mono)] text-sm font-semibold">
												{team.matchPercentage
													.toFixed(3)
													.replace(/^0/, "")}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</section>

				<section className="rounded-md border border-[var(--surface-alt)] bg-[var(--surface)] p-6">
					<div className="flex items-center justify-between">
						<h2 className="font-[family-name:var(--font-serif)] text-2xl">
							Latest Results
						</h2>

						<Link
							href={`/leagues/${league.slug}/schedule?view=past`}
							className="text-sm font-semibold text-[var(--accent)]"
						>
							All results &rarr;
						</Link>
					</div>

					<div className="mt-6 divide-y divide-[var(--surface-alt)]">
						{latestResults.length > 0 ? (
							latestResults.map((match) => (
								<div
									key={match.id}
									className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 py-4 first:pt-0"
								>
									<span>
										{match.awayTeam.name}
									</span>

									<span className="font-[family-name:var(--font-mono)] font-semibold">
										{match.awayScore} &ndash; {match.homeScore}
									</span>

									<span className="text-right">
										{match.homeTeam.name}
									</span>
								</div>
							))
						) : (
							<p className="text-[var(--text-muted)]">
								No results yet.
							</p>
						)}
					</div>
				</section>
			</div>
		</main>
    )
}