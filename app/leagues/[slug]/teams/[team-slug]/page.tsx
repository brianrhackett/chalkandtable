import Link from "next/link";
import { MapPin } from "lucide-react";
import { notFound } from "next/navigation";

import { formatMatchDate } from "@/src/lib/formatMatchDate.ts";

import { getLeagueTeam } from "@/src/lib/leagues/teams/getLeagueTeam";
import { getPlayerStats } from "@/src/lib/leagues/teams/getPlayerStats";
import { getAvailablePlayers } from "@/src/lib/leagues/teams/getAvailablePlayers";
import { getRemovablePlayers } from "@/src/lib/leagues/teams/getRemovablePlayers";
import SeasonSelect from "@/app/components/SeasonSelect";
import RosterManager from "@/app/components/RosterManager";
import RosterPlayerActions from "@/app/components/RosterPlayerActions";
import CaptainEditor from "@/app/components/CaptainEditor";



type TeamPageProps = {
	params: Promise<{
		slug: string;
		teamSlug: string;
	}>;
	searchParams: Promise<{
        season?: string;
    }>;
};

export default async function TeamPage({
	params,
	searchParams,
}: TeamPageProps) {
	const {
		slug,
		"team-slug": teamSlug,
	} = await params;

	const { season: seasonSlug } = await searchParams;

	const data = await getLeagueTeam(
		slug,
		teamSlug,
		seasonSlug
	);

	if (!data) {
		notFound();
	}

	const {
		league,
		team,
		seasonTeam,
		venue,
		season,
		seasons,
		rosterPlayers,
		record,
		upcomingMatches,
		recentMatches,
	} = data;

	const captain = rosterPlayers.find(
		(player) => player.captainPosition === "primary"
	);

	const coCaptain = rosterPlayers.find(
		(player) => player.captainPosition === "co_captain"
	);

	const playerStats = await getPlayerStats(
		season.id,
		team.id
	);

	const playerStatsById = new Map(
		playerStats.map((player) => [
			player.rosterPlayerId,
			player,
		])
	);

	const removablePlayerIds = new Set(
		await getRemovablePlayers(season.id, team.id)
	);

	const players = rosterPlayers.map((player) => {
		const stats = seasonTeam.playerStatsEnabled
			? playerStats.find(
				(stats) => stats.rosterPlayerId === player.id
			) ?? null
			: null;

		return {
			...player,
			stats,
			canRemove: removablePlayerIds.has(player.id),
		};
	})
	.sort((a, b) => {
        // Players with stats come first
        if (!a.stats && !b.stats) return 0;
        if (!a.stats) return 1;
        if (!b.stats) return -1;

        // Most wins first
        if (b.stats.wins !== a.stats.wins) {
            return b.stats.wins - a.stats.wins;
        }

        // Fewest losses breaks ties
        return a.stats.losses - b.stats.losses;
    });

	const availablePlayers = await getAvailablePlayers(
		league.id,
		season.id
	);

	return (
		<main className="mx-auto w-full max-w-7xl px-6 py-12">
			<Link
				href={`/leagues/${league.slug}/teams`}
				className="text-sm font-semibold text-[var(--text-muted)] transition-colors hover:text-[var(--accent)]"
			>
				&larr; All Teams
			</Link>

			<div className="mt-8 border-b border-[var(--surface-alt)] pb-8">
				<div className="flex justify-between py-4 first:pt-0 flex-col gap-6 sm:flex-row sm:items-center">
					<div>
						<p className="text-sm font-semibold uppercase tracking-wider text-[var(--accent)]">
							Team
						</p>

						<h1 className="mt-2 font-[family-name:var(--font-serif)] text-5xl font-semibold">
							{team.name}
						</h1>
					</div>
					<div>
						{venue && (
							<div className="mt-4 flex items-center gap-2 text-sm text-[var(--text-muted)]">
								<MapPin
									size={16}
									strokeWidth={1.75}
									className="text-[var(--accent)]"
								/>

								<span>{venue.name}</span>
							</div>
						)}
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
			</div>

			{season && record && (
				<>
					<div className="grid border-b border-[var(--surface-alt)] grid-cols-3 sm:grid-cols-4">
						<div className="py-6 sm:border-r sm:border-[var(--surface-alt)] col-span-3 sm:col-span-1">
							<p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
								Record
							</p>

							<p className="mt-2 font-[family-name:var(--font-mono)] text-2xl font-semibold">
								{record.wins}-{record.losses}
							</p>
						</div>

						<div className="py-6 sm:border-r sm:border-[var(--surface-alt)] sm:px-6">
							<p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
								Racks Won
							</p>

							<p className="mt-2 font-[family-name:var(--font-mono)] text-2xl font-semibold">
								{record.racksWon}
							</p>
						</div>

						<div className="py-6 sm:border-r sm:border-[var(--surface-alt)] sm:px-6">
							<p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
								Racks Lost
							</p>

							<p className="mt-2 font-[family-name:var(--font-mono)] text-2xl font-semibold">
								{record.racksLost}
							</p>
						</div>

						<div className="py-6 sm:pl-6">
							<p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
								Rack %
							</p>

							<p className="mt-2 font-[family-name:var(--font-mono)] text-2xl font-semibold">
								{record.rackPercentage
									.toFixed(3)
									.replace(/^0/, "")}
							</p>
						</div>
					</div>

					<div className="mt-10 grid gap-8 lg:grid-cols-2">
						<section>
							<h2 className="font-[family-name:var(--font-serif)] text-lg text-[var(--accent)] font-semibold">
								Upcoming
							</h2>

							<div className="mt-4 overflow-hidden rounded-md border border-[var(--surface-alt)] bg-[var(--surface)]">
								{upcomingMatches.length ? (
									upcomingMatches
										.slice(0, 5)
										.map((match) => (
											<div
												key={match.id}
												className="flex items-center justify-between gap-6 border-b border-[var(--surface-alt)] px-5 py-4 last:border-b-0"
											>
												<div>
													<p className="text-xs text-[var(--text-muted)]">
														Week {match.week} ·{" "}
														{match.isHome
															? "Home"
															: "Away"}
													</p>

													<Link
														href={`/leagues/${league.slug}/teams/${match.opponent.slug}`}
														className="mt-1 block font-[family-name:var(--font-serif)] text-lg font-semibold hover:text-[var(--accent)]"
													>
														{match.opponent.name}
													</Link>
												</div>

												<p className="text-sm text-[var(--text-muted)]">
													{formatMatchDate(match.scheduledAt)}
												</p>
											</div>
										))
								) : (
									<p className="px-5 py-6 text-sm text-[var(--text-muted)]">
										No upcoming matches.
									</p>
								)}
							</div>
						</section>

						<section>
							<h2 className="font-[family-name:var(--font-serif)] text-lg text-[var(--accent)] font-semibold">
								Recent Results
							</h2>

							<div className="mt-4 overflow-hidden rounded-md border border-[var(--surface-alt)] bg-[var(--surface)]">
								{recentMatches.length ? (
									recentMatches
										.slice(0, 5)
										.map((match) => {
											const won =
												match.teamScore !== null &&
												match.opponentScore !== null &&
												match.teamScore >
													match.opponentScore;

											return (
												<div
													key={match.id}
													className="flex items-center justify-between gap-6 border-b border-[var(--surface-alt)] px-5 py-4 last:border-b-0"
												>
													<div>
														<p className="text-xs text-[var(--text-muted)]">
															Week {match.week} ·{" "}
															{match.isHome
																? "Home"
																: "Away"}
														</p>

														<Link
															href={`/leagues/${league.slug}/teams/${match.opponent.slug}`}
															className="mt-1 block font-[family-name:var(--font-serif)] text-lg font-semibold hover:text-[var(--accent)]"
														>
															{match.opponent.name}
														</Link>
													</div>

													<div className="flex items-center gap-3">
														<span
															className={`text-xs font-bold ${
																won
																	? "text-[var(--accent)]"
																	: "text-[var(--text-muted)]"
															}`}
														>
															{won ? "W" : "L"}
														</span>

														<span className="font-[family-name:var(--font-mono)] text-lg font-semibold">
															{match.teamScore}
															&nbsp;&ndash;&nbsp;
															{match.opponentScore}
														</span>
													</div>
												</div>
											);
										})
								) : (
									<p className="px-5 py-6 text-sm text-[var(--text-muted)]">
										No results yet.
									</p>
								)}
							</div>
						</section>

						<section>
							<h2 className="font-[family-name:var(--font-serif)] text-lg text-[var(--accent)] font-semibold">
								Team Captains
							</h2>
							<div className="mt-4 overflow-hidden rounded-md border border-[var(--surface-alt)] bg-[var(--surface)]">
								<table className="w-full text-sm">
									<thead>
										<tr className="border-b border-border text-left">
											<th className="px-3 py-3">Role</th>
											<th className="px-3 py-3">Name</th>
											<th className="px-3 py-3">Contact</th>
										</tr>
									</thead>

									<tbody className="divide-y divide-[var(--surface-alt)]">
										<tr>
											<td className="px-3 py-3">Captain</td>
											<td className="px-3 py-3">{captain?.player.firstName} {captain?.player.lastName}</td>
											<td className="px-3 py-3">
												<div>{captain?.player.phone}</div>
												<div>{captain?.player.email}</div> 
											</td>
										</tr>
										<tr>
											<td className="px-3 py-3">Co-Captain</td>
											<td className="px-3 py-3">{coCaptain?.player.firstName} {coCaptain?.player.lastName}</td>
											<td className="px-3 py-3">
												<div>{coCaptain?.player.phone}</div>
												<div>{coCaptain?.player.email}</div>
											</td>
										</tr>
									</tbody>
								</table>
								{season.active && (
									<CaptainEditor
										players={rosterPlayers.map((rosterPlayer) => ({
											id: rosterPlayer.id,
											firstName: rosterPlayer.player.firstName,
											lastName: rosterPlayer.player.lastName,
											email: rosterPlayer.player.email,
											phone: rosterPlayer.player.phone,
										}))}
										captainId={captain?.id ?? null}
										coCaptainId={coCaptain?.id ?? null}
										leagueId={league.id}
										seasonId={season.id}
										teamId={team.id}
									/>
								)}
							</div>
						</section>

						<section>
							<h2 className="font-[family-name:var(--font-serif)] text-lg text-[var(--accent)] font-semibold">
								Roster
							</h2>
							<div className="mt-4 overflow-hidden rounded-md border border-[var(--surface-alt)] bg-[var(--surface)]">
								<table className="w-full text-sm">
									<thead>
										<tr className="border-b border-border text-left">
											<th className="w-px whitespace-nowrap"></th>
											<th className="px-4 py-3 font-semibold">Player</th>

											{seasonTeam.playerStatsEnabled && (
												<>
													<th className="px-3 py-3 text-center font-semibold">W</th>
													<th className="px-3 py-3 text-center font-semibold">L</th>
													<th className="px-4 py-3 text-right font-semibold">Win %</th>
												</>
											)}
										</tr>
									</thead>

									<tbody className="divide-y divide-[var(--surface-alt)]">
										{players.map((player) => (
								
											<tr key={player.id}>
												<td className="px-4 py-3">
													<RosterPlayerActions
														rosterPlayerId={player.id}
														playerId={player.player.id}
														firstName={player.player.firstName}
														lastName={player.player.lastName}
														email={player.player.email}
														phone={player.player.phone}
														leagueId={league.id}
														seasonId={season.id}
														teamId={team.id}
														canRemove={player.canRemove}
														userId={player.player.userId}
														captainPosition={player.captainPosition}
													/>
												</td>
												<td className="px-4 py-3">
													{player.player.firstName} {player.player.lastName}
												</td>

												{seasonTeam.playerStatsEnabled && player.stats && (
													<>
														<td className="px-3 py-3 text-center tabular-nums font-[family-name:var(--font-mono)]">
															{player.stats.wins}
														</td>
														<td className="px-3 py-3 text-center tabular-nums font-[family-name:var(--font-mono)]">
															{player.stats.losses}
														</td>
														<td className="px-4 py-3 text-right tabular-nums font-[family-name:var(--font-mono)]">
															{(
																player.stats.wins /
																(player.stats.wins + player.stats.losses)
															).toFixed(3)}
														</td>
													</>
												)}
											</tr>
										))}	
									</tbody>
								</table>

								<RosterManager
								    leagueId={league.id}
									seasonId={season.id}
									teamId={team.id}
								    availablePlayers={availablePlayers.map((player) => ({
										id: player.id,
										firstName: player.firstName,
										lastName: player.lastName,
									}))}
								/>

							</div>
						</section>
					</div>
				</>
			)}
		</main>
	);
}