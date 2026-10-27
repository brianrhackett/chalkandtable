import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/src/prisma/db";

import { getLeagueStandings } from "@/src/lib/leagues/getLeagueStandings";
import { getSeasonPlayoffs } from "@/src/lib/leagues/getSeasonPlayoffs";
import { canManageLeague } from "@/src/lib/permissions/league";
import SeasonSelect from "@/app/components/SeasonSelect";
import PlayoffBracket from "@/app/components/PlayoffBracket";
import StartPlayoffsButton from "@/app/components/StartPlayoffsButton";

import { Trophy } from "lucide-react";

type StandingsPageProps = {
	params: Promise<{
		slug: string;
	}>;
	searchParams: Promise<{
        season?: string;
    }>;
};

export default async function StandingsPage({
	params,
	searchParams,
}: StandingsPageProps) {
	const session = await auth();

    const user = await db.orm.public.User.first({
		email: session.user.email,
	});

	const { slug } = await params;
	const { season: seasonSlug } = await searchParams;

	const data = await getLeagueStandings(slug, seasonSlug);

	if (!data) {
		notFound();
	}
	console.log(data);
	const {
		league,
		season,
		seasons,
		standings,
		playoffTeamCount,
		regularSeasonComplete,
	} = data;

	const playoffs = await getSeasonPlayoffs(season.id);

	const membership = await db.orm.public.LeagueUser
		.where({
			userId: user.id,
            leagueId: league.id
		})
		.first();

	if (!season) {
		return (
			<main className="mx-auto w-full max-w-7xl px-6 py-12">
				<p className="text-sm font-semibold uppercase tracking-wider text-[var(--accent)]">
					Standings
				</p>

				<h1 className="mt-2 font-[family-name:var(--font-serif)] text-4xl font-semibold sm:text-5xl">
					League Standings
				</h1>

				<p className="mt-3 text-[var(--text-muted)]">
					There is no active season.
				</p>
			</main>
		);
	}

	return (
		<main className="mx-auto w-full max-w-7xl px-6 py-12">
			<div className="flex justify-between py-4 first:pt-0 flex-col gap-6 sm:flex-row sm:items-center">
				<div>
					<h1 className="mt-2 font-[family-name:var(--font-serif)] text-[var(--accent)] text-xl font-semibold sm:text-2xl">
						League Standings
					</h1>

					<p className="mt-3 text-[var(--text-muted)]">
						{season.name} season
					</p>
				</div>
				<div>
					<SeasonSelect 
						seasons={seasons.map((season) => ({
							id: season.id,
							name: season.name,
							slug: season.slug,
							active: season.active,
						}))}
						selectedSeason={{
							id: season.id,
							name: season.name,
							slug: season.slug,
							active: season.active,
						}}
					/>
				</div>
			</div>

			{!playoffs.started && regularSeasonComplete && canManageLeague(membership.role) && (
				<StartPlayoffsButton
				    leagueId={league.id}
					seasonId={season.id}
					teamCount={playoffTeamCount}
					teams={standings.map((standing) => ({
						id: standing.teamId,
						name: standing.name,
						wins: standing.wins,
						losses: standing.losses,
					}))}
				/>
			)}

			{playoffs.championTeamId !== null && (() => {
				const champion = playoffs.rounds
					.flatMap((round) => round.series)
					.flatMap((series) => [
						series.higherSeed,
						series.lowerSeed,
					])
					.find((team) =>
						team.teamId === playoffs.championTeamId
					);

				if (!champion) return null;

				return (
					<div className="my-8 rounded-lg border border-[var(--accent)] bg-[var(--surface-alt)] px-6 py-8 text-center">
						<div className="mb-3 text-[var(--accent)] text-center">
							<Trophy 
								className="inline size-12"
							/>
						</div>

						<div className="mb-2 text-sm font-semibold uppercase tracking-widest text-[var(--accent)]">
							League Champions
						</div>

						<h3 className="text-3xl font-bold text-[var(--text)]">
							{champion.name}
						</h3>

						<p className="mt-2 text-sm text-[var(--text-muted)]">
							Congratulations on winning the championship!
						</p>
					</div>
				);
			})()}

			{playoffs.started && (
				<PlayoffBracket 
					playoffs={playoffs}
			        leagueSlug={league.slug}
					leagueId={league.id}
					canManagePlayoffs={canManageLeague(membership.role)}
				/>
			)}

			<div className="mt-10 overflow-hidden rounded-md border border-[var(--surface-alt)] bg-[var(--surface)]">
				<div className="overflow-x-auto">
					<table className="w-full border-collapse">
						<thead>
							<tr className="border-b border-[var(--surface-alt)] bg-[var(--surface-alt)]">
								<th className="w-16 px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
									#
								</th>

								<th className="sticky left-0 z-20 min-w-40 bg-[var(--surface-alt)] px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] sm:static">
									Team
								</th>

								<th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
									P
								</th>

								<th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
									W
								</th>

								<th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
									L
								</th>

								<th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
									PCT
								</th>

								<th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
									RW
								</th>

								<th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
									RL
								</th>

								<th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
									Rack %
								</th>
							</tr>
						</thead>

						<tbody className="divide-y divide-[var(--surface-alt)]">
							{standings.map((team, index) => (
								<tr
									key={team.teamId}
									className={`
										transition-colors hover:bg-[var(--surface-alt)]
										${
											playoffTeamCount !== null && index === playoffTeamCount - 1
												? "border-b-2 border-[var(--accent)]"
												: ""
										}
									`}
								>
									<td className="px-5 py-5 text-center font-[family-name:var(--font-mono)] text-sm text-[var(--text-muted)]">
										{team.rank}
									</td>

									<td className="sticky left-0 z-10 min-w-30 bg-[var(--surface)] px-5 py-5 sm:static sm:bg-transparent">
										<Link
											href={`/leagues/${league.slug}/teams/${team.slug}`}
											className="text-lg font-semibold transition-colors hover:text-[var(--accent)]"
										>
											{team.name}
										</Link>
									</td>

									<td className="px-4 py-5 text-center font-[family-name:var(--font-mono)] text-sm">
										{team.played}
									</td>

									<td className="px-4 py-5 text-center font-[family-name:var(--font-mono)] text-sm font-semibold">
										{team.wins}
									</td>

									<td className="px-4 py-5 text-center font-[family-name:var(--font-mono)] text-sm">
										{team.losses}
									</td>

									<td className="px-4 py-5 text-center font-[family-name:var(--font-mono)] text-sm font-semibold">
										{team.matchPercentage
											.toFixed(3)
											.replace(/^0/, "")}
									</td>

									<td className="px-4 py-5 text-center font-[family-name:var(--font-mono)] text-sm">
										{team.racksWon}
									</td>

									<td className="px-4 py-5 text-center font-[family-name:var(--font-mono)] text-sm">
										{team.racksLost}
									</td>

									<td className="px-5 py-5 text-center font-[family-name:var(--font-mono)] text-sm">
										{team.rackPercentage
											.toFixed(3)
											.replace(/^0/, "")}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			<div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-xs text-[var(--text-muted)]">
				<span>
					<strong className="text-[var(--text)]">P</strong>{" "}
					Played
				</span>

				<span>
					<strong className="text-[var(--text)]">W</strong>{" "}
					Wins
				</span>

				<span>
					<strong className="text-[var(--text)]">L</strong>{" "}
					Losses
				</span>

				<span>
					<strong className="text-[var(--text)]">RW</strong>{" "}
					Racks Won
				</span>

				<span>
					<strong className="text-[var(--text)]">RL</strong>{" "}
					Racks Lost
				</span>
			</div>
		</main>
	);
}