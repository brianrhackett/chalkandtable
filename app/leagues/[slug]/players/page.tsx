import Link from "next/link";
import { notFound } from "next/navigation";

import { getLeaguePlayers } from "@/src/lib/leagues/getLeaguePlayers";

type PlayersPageProps = {
	params: Promise<{
		slug: string;
	}>;
};

export default async function PlayersPage({
	params,
}: PlayersPageProps) {
	const { slug } = await params;

	const data = await getLeaguePlayers(slug);

	if (!data) {
		notFound();
	}

	const {
		league,
		season,
		players,
	} = data;

	return (
		<main className="mx-auto w-full max-w-7xl px-6 py-12">
			<div>
				<p className="text-sm font-semibold uppercase tracking-wider text-[var(--accent)]">
					Players
				</p>

				<h1 className="mt-2 font-[family-name:var(--font-serif)] text-4xl font-semibold sm:text-5xl">
					League Players
				</h1>

				{season && (
					<p className="mt-3 text-[var(--text-muted)]">
						{season.name} season
					</p>
				)}
			</div>

			{!season ? (
				<p className="mt-10 text-[var(--text-muted)]">
					There is no active season.
				</p>
			) : players.length === 0 ? (
				<p className="mt-10 text-[var(--text-muted)]">
					No players have been added to this season yet.
				</p>
			) : (
				<div className="mt-10 overflow-hidden rounded-md border border-[var(--surface-alt)] bg-[var(--surface)]">
					<div className="flex items-center justify-between border-b border-[var(--surface-alt)] px-6 py-4">
						<p className="text-sm text-[var(--text-muted)]">
							<span className="font-[family-name:var(--font-mono)] font-semibold text-[var(--text)]">
								{players.length}
							</span>{" "}
							players
						</p>
					</div>

					<div className="overflow-x-auto">
						<table className="w-full">
							<thead>
								<tr className="border-b border-[var(--surface-alt)] bg-[var(--surface-alt)]">
									<th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
										Player
									</th>

									<th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
										Team
									</th>
								</tr>
							</thead>

							<tbody className="divide-y divide-[var(--surface-alt)]">
								{players.map((player) => (
									<tr
										key={player.id}
										className="transition-colors hover:bg-[var(--surface-alt)]"
									>
										<td className="px-6 py-5">
											<p className="font-[family-name:var(--font-serif)] text-lg font-semibold">
												{player.name}
											</p>
										</td>

										<td className="px-6 py-5">
											<Link
												href={`/leagues/${league.slug}/teams/${player.team.slug}`}
												className="text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--accent)]"
											>
												{player.team.name}
											</Link>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}
		</main>
	);
}