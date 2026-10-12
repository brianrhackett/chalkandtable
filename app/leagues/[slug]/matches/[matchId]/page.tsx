import Link from "next/link";
import { notFound } from "next/navigation";
import { getMatch } from "@/src/lib/leagues/matches/getMatch";
import RackEditor from "@/app/components/RackEditor";

type MatchPageProps = {
    params: Promise<{
        slug: string;
        matchId: string;
    }>;
};

export default async function MatchPage({
    params,
}: MatchPageProps) {
    const { slug, matchId } = await params;

    const data = await getMatch(
        slug,
        Number(matchId),
    );

    if (!data) {
        notFound();
    }

    const {
        league,
        match,
        homeTeam,
        awayTeam,
        homeLineup,
        awayLineup,
        racks,
    } = data;

    return (
        <div className="mx-auto max-w-5xl px-6 py-8">
            <div className="mb-6">
                <Link
                    href={`/leagues/${league.slug}/schedule`}
                    className="font-sans text-sm font-semibold text-[var(--accent)] hover:underline"
                >
                    &larr; Back to Schedule
                </Link>
            </div>

            <div className="rounded-xl border border-[var(--surface-alt)] bg-[var(--surface)]">
                <div className="border-b border-[var(--surface-alt)] px-6 py-5">
                    <div className="font-sans text-sm text-[var(--text-muted)]">
                        {match.week !== null
                            ? `Week ${match.week}`
                            : "Playoffs"}
                    </div>

                    <h1 className="mt-1 font-serif text-2xl font-bold">
                        Match Details
                    </h1>
                </div>

                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-6 px-6 py-10">
                    <div className="text-right">
                        <div className="font-serif text-2xl font-bold">
                            {awayTeam.name}
                        </div>

                        {match.awayScore !== null && (
                            <div className="mt-2 font-mono text-4xl font-bold">
                                {match.awayScore}
                            </div>
                        )}
                    </div>

                    <div className="font-sans text-sm font-semibold text-[var(--text-muted)]">
                        {match.homeScore !== null &&
                        match.awayScore !== null
                            ? " "
                            : "@"}
                    </div>

                    <div>
                        <div className="font-serif text-2xl font-bold">
                            {homeTeam.name}
                        </div>

                        {match.homeScore !== null && (
                            <div className="mt-2 font-mono text-4xl font-bold">
                                {match.homeScore}
                            </div>
                        )}
                    </div>
                </div>

                {(awayTeam.playerStatsEnabled ||
                    homeTeam.playerStatsEnabled) && (
                    <div>
                        <RackEditor 
                            leagueId={league.id}
                            matchId={match.id}
                            awayTeam={{
                                id: awayTeam.id,
                                name: awayTeam.name,
                            }}
                            homeTeam={{
                                id: homeTeam.id,
                                name: homeTeam.name,
                            }}
                            existingRacks={racks.map((rack) => ({
                                rackNumber: rack.rackNumber,
                                winnerTeamId: rack.winnerTeamId,
                            }))}
                        />
                        <div className="grid gap-8 border-t border-[var(--surface-alt)] px-6 py-6 sm:grid-cols-2">
                            {awayTeam.playerStatsEnabled && (
                                <div>
                                    <div className="mb-4 flex items-baseline gap-3">
                                        <h2 className="font-serif text-lg font-bold">
                                            {awayTeam.name} Lineup
                                        </h2>

                                        <Link
                                            href={`/leagues/${league.slug}/matches/${match.id}/lineup/${awayTeam.id}`}
                                            className="font-sans text-xs font-semibold text-[var(--accent)] hover:underline"
                                        >
                                            Edit
                                        </Link>
                                    </div>

                                    {awayLineup.length > 0 ? (
                                        <div className="space-y-2">
                                            {awayLineup.map((player) => (
                                                <div
                                                    key={player.rosterPlayerId}
                                                    className="flex items-center gap-3"
                                                >
                                                    <span className="w-6 font-sans text-sm font-semibold text-[var(--text-muted)]">
                                                        {player.position}.
                                                    </span>

                                                    <span className="font-sans font-semibold">
                                                        {player.name}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="font-sans text-sm text-[var(--text-muted)]">
                                            No lineup submitted.
                                        </p>
                                    )}
                                </div>
                            )}

                            {homeTeam.playerStatsEnabled && (
                                <div>
                                    <div className="mb-4 flex items-baseline gap-3">
                                        <h2 className="font-serif text-lg font-bold">
                                            {homeTeam.name} Lineup
                                        </h2>

                                        <Link
                                            href={`/leagues/${league.slug}/matches/${match.id}/lineup/${homeTeam.id}`}
                                            className="font-sans text-xs font-semibold text-[var(--accent)] hover:underline"
                                        >
                                            Edit
                                        </Link>
                                    </div>

                                    {homeLineup.length > 0 ? (
                                        <div className="space-y-2">
                                            {homeLineup.map((player) => (
                                                <div
                                                    key={player.rosterPlayerId}
                                                    className="flex items-center gap-3"
                                                >
                                                    <span className="w-6 font-sans text-sm font-semibold text-[var(--text-muted)]">
                                                        {player.position}.
                                                    </span>

                                                    <span className="font-sans font-semibold">
                                                        {player.name}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="font-sans text-sm text-[var(--text-muted)]">
                                            No lineup submitted.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}