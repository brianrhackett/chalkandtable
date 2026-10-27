import { db } from "@/src/prisma/db";

export type PlayoffMatch = {
    id: number;
    seriesMatch: number | null;
    homeTeamId: number;
    awayTeamId: number;
    scheduledAt: string;
    homeScore: number | null;
    awayScore: number | null;
    status: string;
};

export type PlayoffTeam = {
    teamId: number;
    seed: number;
    name: string;
    slug: string;
    wins: number;
};

export type SeasonPlayoffSeries = {
    id: number;
    round: string;
    seriesNumber: number;
    bestOf: number;

    higherSeed: PlayoffTeam;
    lowerSeed: PlayoffTeam;

    winnerTeamId: number | null;

    matches: PlayoffMatch[];
};

export type SeasonPlayoffRound = {
    round: string;
    series: SeasonPlayoffSeries[];
};

export type SeasonPlayoffs = {
    started: boolean;
    rounds: SeasonPlayoffRound[];
    championTeamId: number | null;
};

export async function getSeasonPlayoffs(
    seasonId: number
): Promise<SeasonPlayoffs> {
    const playoffSeries = await db.orm.public.PlayoffSeries
        .where({ seasonId })
        .orderBy([
            (series) => series.round.asc(),
            (series) => series.seriesNumber.asc(),
        ])
        .all();

    if (playoffSeries.length === 0) {
        return {
            started: false,
            rounds: [],
            championTeamId: null,
        };
    }

    const seriesIds = playoffSeries.map(
        (series) => series.id
    );

    const matches = await db.orm.public.Match
        .where((match) =>
            match.playoffSeriesId.in(seriesIds)
        )
        .all();

    const teamIds = [
        ...new Set(
            playoffSeries.flatMap((series) => [
                series.higherSeedTeamId,
                series.lowerSeedTeamId,
            ])
        ),
    ];

    const teams = await db.orm.public.Team
        .where((team) => team.id.in(teamIds))
        .all();

    const teamsById = new Map(
        teams.map((team) => [
            team.id,
            team,
        ])
    );

    const rounds = new Map<
        string,
        SeasonPlayoffSeries[]
    >();

    const roundOrder: Record<string, number> = {
        Quarterfinal: 1,
        Semifinal: 2,
        Final: 3,
    };

    for (const series of playoffSeries) {
        const higherSeedTeam = teamsById.get(
            series.higherSeedTeamId
        );

        const lowerSeedTeam = teamsById.get(
            series.lowerSeedTeamId
        );

        if (!higherSeedTeam || !lowerSeedTeam) {
            continue;
        }

        const seriesMatches = matches
            .filter(
                (match) =>
                    match.playoffSeriesId === series.id
            )
            .sort(
                (a, b) =>
                    (a.seriesMatch ?? 0) -
                    (b.seriesMatch ?? 0)
            );

        let higherSeedWins = 0;
        let lowerSeedWins = 0;

        for (const match of seriesMatches) {
            if (
                match.status !== "completed" ||
                match.homeScore === null ||
                match.awayScore === null
            ) {
                continue;
            }

            const winnerTeamId =
                match.homeScore > match.awayScore
                    ? match.homeTeamId
                    : match.awayTeamId;

            if (
                winnerTeamId ===
                series.higherSeedTeamId
            ) {
                higherSeedWins++;
            }

            if (
                winnerTeamId ===
                series.lowerSeedTeamId
            ) {
                lowerSeedWins++;
            }
        }

        const winsNeeded =
            Math.floor(series.bestOf / 2) + 1;

        let winnerTeamId: number | null = null;

        if (higherSeedWins >= winsNeeded) {
            winnerTeamId =
                series.higherSeedTeamId;
        } else if (lowerSeedWins >= winsNeeded) {
            winnerTeamId =
                series.lowerSeedTeamId;
        }

        const playoffSeriesData: SeasonPlayoffSeries = {
            id: series.id,
            round: series.round,
            seriesNumber: series.seriesNumber,
            bestOf: series.bestOf,

            higherSeed: {
                teamId: higherSeedTeam.id,
                seed: series.higherSeed,
                name: higherSeedTeam.name,
                slug: higherSeedTeam.slug,
                wins: higherSeedWins,
            },

            lowerSeed: {
                teamId: lowerSeedTeam.id,
                seed: series.lowerSeed,
                name: lowerSeedTeam.name,
                slug: lowerSeedTeam.slug,
                wins: lowerSeedWins,
            },

            winnerTeamId,

            matches: seriesMatches.map((match) => ({
                id: match.id,
                seriesMatch: match.seriesMatch,
                homeTeamId: match.homeTeamId,
                awayTeamId: match.awayTeamId,
                scheduledAt: match.scheduledAt.toString(),
                homeScore: match.homeScore,
                awayScore: match.awayScore,
                status: match.status,
            })),
        };

        const round = String(series.round);

        if (!rounds.has(round)) {
            rounds.set(round, []);
        }

        rounds.get(round)!.push(
            playoffSeriesData
        );
    }

    const playoffRounds: SeasonPlayoffRound[] =
        Array.from(rounds.entries())
            .map(([round, series]) => ({
                round,
                series: series.sort(
                    (a, b) =>
                        a.seriesNumber -
                        b.seriesNumber
                ),
            }))
            .sort(
                (a, b) =>
                    roundOrder[a.round] -
                    roundOrder[b.round]
            );

    /*
     * The champion is the winner of the last
     * playoff round, provided that round contains
     * exactly one series and that series is complete.
     */
    const finalRound =
        playoffRounds.at(-1);

    const championTeamId =
        finalRound?.series.length === 1
            ? finalRound.series[0].winnerTeamId
            : null;

    return {
        started: true,
        rounds: playoffRounds,
        championTeamId,
    };
}