import Link from "next/link";
import { MapPin } from "lucide-react";
import { notFound } from "next/navigation";

import { getLeagueTeam } from "@/src/lib/leagues/getLeagueTeam";

type TeamPageProps = {
	params: Promise<{
		slug: string;
		teamSlug: string;
	}>;
};

export default async function TeamPage({
	params,
}: TeamPageProps) {
	const {
		slug,
		teamSlug,
	} = await params;

	const data = await getLeagueTeam(
		slug,
		teamSlug
	);

	if (!data) {
		notFound();
	}

	const {
		league,
		team,
		venue,
		season,
		record,
		upcomingMatches,
		recentMatches,
	} = data;

	return (
		<main className="mx-auto w-full max-w-7xl px-6 py-12">
			<Link
				href={`/leagues/${league.slug}/teams`}
				className="text-sm font-semibold text-[var(--text-muted)] transition-colors hover:text-[var(--accent)]"
			>
				← All Teams
			</Link>

			<div className="mt-8 border-b border-[var(--surface-alt)] pb-8">
				<p className="text-sm font-semibold uppercase tracking-wider text-[var(--accent)]">
					Team
				</p>

				<h1 className="mt-2 font-[family-name:var(--font-serif)] text-5xl font-semibold">
					{team.name}
				</h1>

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

			{season && record && (
				<>
					<div className="grid border-b border-[var(--surface-alt)] sm:grid-cols-4">
						<div className="py-6 sm:border-r sm:border-[var(--surface-alt)]">
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
							<h2 className="font-[family-name:var(--font-serif)] text-2xl font-semibold">
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
													{new Intl.DateTimeFormat(
														"en-US",
														{
															month: "short",
															day: "numeric",
														}
													).format(
														new Date(match.scheduledAt)
													)}
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
							<h2 className="font-[family-name:var(--font-serif)] text-2xl font-semibold">
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
															{"–"}
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
					</div>
				</>
			)}
		</main>
	);
}