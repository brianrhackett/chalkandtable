import Link from "next/link";
import { db } from "@/src/prisma/db";
import { Temporal } from "@js-temporal/polyfill";
import { formatMatchDate } from "@/src/lib/formatMatchDate.ts";

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


    return (
        <main className="mx-auto w-full max-w-7xl px-6 py-12">
			<section>
				<div className="flex items-end justify-between gap-6">
					<div>
						<h1 className="mt-2 font-[family-name:var(--font-serif)] text-[var(--accent)] text-2xl font-semibold">
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

					<p className="mt-6 text-[var(--text-muted)]">
						{seasonTeams.length} teams competing this season.
					</p>
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

			<section className="mt-12 border-t border-[var(--surface-alt)] py-8 text-center">
				<p className="font-[family-name:var(--font-serif)] text-xl">
					{season.name}
				</p>

				<p className="mt-2 text-sm text-[var(--text-muted)]">
					{seasonTeams.length} Teams
				</p>
			</section>
		</main>
    )
}