import type { db } from "@/src/prisma/db";

type Transaction = Parameters<
    Parameters<typeof db.transaction>[0]
>[0];

import { getPlayoffSeriesResult } from "./getPlayoffSeriesResult";

export async function completePlayoffSeries(
    tx: Transaction,
    seriesId: number
) {
    const series = await tx.orm.public.PlayoffSeries.first({
        id: seriesId,
    });

    if (!series) {
        throw new Error("Playoff series not found.");
    }

    const matches = await tx.orm.public.Match
        .where({ playoffSeriesId: seriesId })
        .all();

    const result = getPlayoffSeriesResult(series, matches);

    if (!result.complete) {
        return result;
    }

    for (const match of matches) {
        if (
            match.status === "scheduled" ||
            match.status === "postponed"
        ) {
            await tx.orm.public.Match
                .where({ id: match.id })
                .update({ status: "cancelled" });
        }
    }

    return result;
}