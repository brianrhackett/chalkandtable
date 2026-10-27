import Link from "next/link";

import type {
    SeasonPlayoffs,
    SeasonPlayoffSeries,
} from "@/lib/leagues/getSeasonPlayoffs";

import SchedulePlayoffSeries from "./SchedulePlayoffSeries";

type PlayoffBracketProps = {
    playoffs: SeasonPlayoffs;
    leagueSlug: string;
    leagueId: number;
    canManagePlayoffs: boolean;
};

export default function PlayoffBracket({
    playoffs,
    leagueSlug,
    leagueId,
    canManagePlayoffs,
}: PlayoffBracketProps) {
    if (!playoffs.started) {
        return null;
    }

    return (
        <section className="mt-10">
            <div className="mb-6">
                <h2 className="text-2xl font-bold">
                    Playoffs
                </h2>

                <p className="mt-1 text-sm text-[var(--text-muted)]">
                    Follow each series through the postseason.
                </p>
            </div>

            <div className="overflow-x-auto">
                <div
                    className="grid min-w-[900px] gap-8"
                    style={{
                        gridTemplateColumns: `repeat(${playoffs.rounds.length}, minmax(0, 1fr))`,
                    }}
                >
                    {playoffs.rounds.map((round) => (
                        <div
                            key={round.round}
                            className="flex flex-col"
                        >
                            <h3 className="mb-5 text-center text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                                {formatRoundName(round.round)}
                            </h3>

                            <div className="flex flex-1 flex-col justify-around gap-6">
                                {round.series.map((series) => (
                                    <SeriesCard
                                        key={series.id}
                                        series={series}
                                        leagueSlug={leagueSlug}
                                        leagueId={leagueId}
                                        canManagePlayoffs={canManagePlayoffs}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function SeriesCard({
    series,
    leagueSlug,
    leagueId,
    canManagePlayoffs,
}: {
    series: SeasonPlayoffSeries;
    leagueSlug: string;
    leagueId: number;
    canManagePlayoffs: boolean;
}) {
    const higherSeedScores = series.matches.map((match) => {
        if (
            match.homeScore === null ||
            match.awayScore === null
        ) {
            return "-";
        }

        return match.homeTeamId === series.higherSeed.teamId
            ? match.homeScore
            : match.awayScore;
    });
    const lowerSeedScores = series.matches.map((match) => {
        if (
            match.homeScore === null ||
            match.awayScore === null
        ) {
            return "-";
        }

        return match.homeTeamId === series.lowerSeed.teamId
            ? match.homeScore
            : match.awayScore;
    });
    return (
        <div className="overflow-hidden rounded-md border border-[var(--surface-alt)] bg-[var(--surface)] shadow-sm">
            <div className="font-bold flex items-center justify-between bg-[var(--surface-alt)] border-b border-[var(--surface)] px-4 py-2 text-xs text-[var(--text-muted)]">
                <span>
                    Series {series.seriesNumber}
                </span>

                <span>
                    Best of {series.bestOf}
                </span>
            </div>

            <TeamRow
                team={series.higherSeed}
                scores={higherSeedScores}
                winner={
                    series.winnerTeamId ===
                    series.higherSeed.teamId
                }
                leagueSlug={leagueSlug}
            />

            <div className="border-t border-[var(--surface-alt)]" />

            <TeamRow
                team={series.lowerSeed}
                scores={lowerSeedScores}
                winner={
                    series.winnerTeamId ===
                    series.lowerSeed.teamId
                }
                leagueSlug={leagueSlug}
            />

            {series.winnerTeamId === null && canManagePlayoffs && (
                <div className="border-t border-[var(--surface-alt)] px-4 py-3">
                    <SchedulePlayoffSeries
                        leagueId={leagueId}
                        series={series}
                    />
                </div>
            )}
        </div>
    );
}

function TeamRow({
    team,
    scores,
    winner,
    leagueSlug,
}: {
    team: SeasonPlayoffSeries["higherSeed"];
    scores: (number | string)[];
    winner: boolean;
    leagueSlug: string;
}) {
    return (
        <div
            className={`grid grid-cols-[2rem_1fr_1fr_auto] items-center gap-3 px-4 py-3 ${
                winner
                    ? "font-semibold"
                    : ""
            }`}
        >
            <span className="font-[family-name:var(--font-mono)] text-xs text-[var(--text-muted)]">
                {team.seed}
            </span>

            <Link
                href={`/leagues/${leagueSlug}/teams/${team.slug}`}
                className="transition-colors hover:text-[var(--accent)]"
            >
                {team.name}
            </Link>


            <div className="flex gap-3 font-[family-name:var(--font-mono)] text-sm text-[var(--text-muted)] font-normal">
                {scores.map((score, index) => (
                    <span
                        key={index}
                        className="w-4 text-center"
                    >
                        {score}
                    </span>
                ))}
            </div>
            
            <span
                className={`font-[family-name:var(--font-mono)] text-lg ${
                    winner
                        ? "text-[var(--accent)]"
                        : ""
                }`}
            >
                {team.wins}
            </span>
        </div>
    );
}

function formatRoundName(round: string) {
    return round
        .replaceAll("_", " ")
        .replace(/\b\w/g, (letter) =>
            letter.toUpperCase()
        );
}