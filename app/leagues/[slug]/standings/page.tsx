import Link from "next/link";
import { notFound } from "next/navigation";

import { getLeagueStandings } from "@/src/lib/leagues/getLeagueStandings";

import SeasonSelect from "@/app/components/SeasonSelect";

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
	const { slug } = await params;
	const { season: seasonSlug } = await searchParams;

	const data = await getLeagueStandings(slug, seasonSlug);

	if (!data) {
		notFound();
	}

	const {
		league,
		season,
		seasons,
		standings,
	} = data;

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
			<div className="flex items-center justify-between py-4 first:pt-0">
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
						seasons={seasons}
					    selectedSeason={season}
					/>
				</div>
			</div>

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
									className="transition-colors hover:bg-[var(--surface-alt)]"
								>
									<td className="px-5 py-5 text-center font-[family-name:var(--font-mono)] text-sm text-[var(--text-muted)]">
										{index + 1}
									</td>

									<td className="sticky left-0 z-10 min-w-40 bg-[var(--surface)] px-5 py-5 sm:static sm:bg-transparent">
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