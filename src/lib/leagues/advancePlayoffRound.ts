import type { db } from "@/src/prisma/db";

import { getCompletedPlayoffRound } from "./getCompletedPlayoffRound";
import { pairPlayoffTeams } from "./pairPlayoffTeams";

type Transaction = Parameters<
    Parameters<typeof db.transaction>[0]
>[0];

type PlayoffRound = "Quarterfinal" | "Semifinal" | "Final";

const roundDepth: Record<PlayoffRound, number> = {
    Quarterfinal: 3,
    Semifinal: 2,
    Final: 1,
};

const nextRound: Record<
    Exclude<PlayoffRound, "Final">,
    PlayoffRound
> = {
    Quarterfinal: "Semifinal",
    Semifinal: "Final",
};

export async function advancePlayoffRound(
    tx: Transaction,
    seasonId: number,
    currentRound: PlayoffRound
) {
    // Finals have no next round.
    if (currentRound === "Final") {
        return;
    }

    const winners = await getCompletedPlayoffRound(
        tx,
        seasonId,
        currentRound
    );

    // Not every series has finished yet.
    if (!winners) {
        return;
    }

    const playoff = await tx.orm.public.Playoff.first({
        seasonId,
    });

    if (!playoff) {
        throw new Error("Playoff configuration not found.");
    }

    const followingRound = nextRound[currentRound];

    // Prevent duplicate next-round series.
    const existingSeries = await tx.orm.public.PlayoffSeries
        .where({
            seasonId,
            round: followingRound,
        })
        .all();

    if (existingSeries.length > 0) {
        return;
    }

    // Configuration rounds start at 1, regardless of
    // whether playoffs begin with quarterfinals or semifinals.
    const openingDepth = Math.log2(playoff.teamCount);

    const nextConfigRound =
        openingDepth - roundDepth[currentRound] + 2;

    const roundConfig = await tx.orm.public.PlayoffRoundConfig
        .where({
            playoffId: playoff.id,
            round: nextConfigRound,
        })
        .first();

    if (!roundConfig) {
        throw new Error("Next-round configuration not found.");
    }

    const pairs = pairPlayoffTeams(
        winners,
        playoff.reseed
    );

    for (const [index, pair] of pairs.entries()) {
        const [first, second] = pair;

        const higherSeed =
            first.seed < second.seed ? first : second;

        const lowerSeed =
            first.seed < second.seed ? second : first;

        await tx.orm.public.PlayoffSeries.create({
            seasonId,
            playoffId: playoff.id,
            round: followingRound,
            seriesNumber: index + 1,
            higherSeedTeamId: higherSeed.teamId,
            higherSeed: higherSeed.seed,
            lowerSeedTeamId: lowerSeed.teamId,
            lowerSeed: lowerSeed.seed,
            bestOf: roundConfig.bestOf,
        });
    }
}