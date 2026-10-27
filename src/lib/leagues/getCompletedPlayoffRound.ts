import type { db } from "@/src/prisma/db";
import { getPlayoffSeriesResult } from "./getPlayoffSeriesResult";

type Transaction = Parameters<
    Parameters<typeof db.transaction>[0]
>[0];

export async function getCompletedPlayoffRound(
    tx: Transaction,
    seasonId: number,
    round: string
) {
    const series = await tx.orm.public.PlayoffSeries
        .where({ seasonId })
        .all();

    const roundSeries = series.filter(
        (item) => item.round === round
    );

    if (roundSeries.length === 0) {
        return null;
    }

    const winners = [];

    for (const item of roundSeries) {
        const matches = await tx.orm.public.Match
            .where({ playoffSeriesId: item.id })
            .all();

        const result = getPlayoffSeriesResult(item, matches);

        if (!result.complete || result.winnerTeamId === null) {
            return null;
        }

        winners.push({
            teamId: result.winnerTeamId,
            seed: result.winnerTeamId === item.higherSeedTeamId
                ? item.higherSeed
                : item.lowerSeed,
            seriesNumber: item.seriesNumber,
        });
    }

    return winners;
}