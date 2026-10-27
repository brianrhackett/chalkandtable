type SeriesMatch = {
    status: string;
    homeTeamId: number;
    awayTeamId: number;
    homeScore: number | null;
    awayScore: number | null;
};

type Series = {
    higherSeedTeamId: number;
    lowerSeedTeamId: number;
    bestOf: number;
};

export function getPlayoffSeriesResult(
    series: Series,
    matches: SeriesMatch[]
) {
    let higherSeedWins = 0;
    let lowerSeedWins = 0;

    for (const match of matches) {
        if (
            match.status !== "completed" ||
            match.homeScore === null ||
            match.awayScore === null ||
            match.homeScore === match.awayScore
        ) {
            continue;
        }

        const winnerTeamId =
            match.homeScore > match.awayScore
                ? match.homeTeamId
                : match.awayTeamId;

        if (winnerTeamId === series.higherSeedTeamId) {
            higherSeedWins++;
        } else if (winnerTeamId === series.lowerSeedTeamId) {
            lowerSeedWins++;
        }
    }

    const winsNeeded = Math.floor(series.bestOf / 2) + 1;

    const winnerTeamId =
        higherSeedWins >= winsNeeded
            ? series.higherSeedTeamId
            : lowerSeedWins >= winsNeeded
                ? series.lowerSeedTeamId
                : null;

    return {
        higherSeedWins,
        lowerSeedWins,
        winsNeeded,
        winnerTeamId,
        complete: winnerTeamId !== null,
    };
}