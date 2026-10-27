"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/src/prisma/db";
import { getLeaguePermissions } from "@/src/lib/leagues/getLeaguePermissions";
import { completePlayoffSeries } from "@/src/lib/leagues/completePlayoffSeries";
import { advancePlayoffRound } from "@/src/lib/leagues/advancePlayoffRound";
import { getPlayoffSeriesResult } from "@/src/lib/leagues/getPlayoffSeriesResult";

export async function saveMatchScore(
    matchId: number,
    homeScore: number,
    awayScore: number
) {
    if (
        !Number.isInteger(homeScore) ||
        !Number.isInteger(awayScore) ||
        homeScore < 0 ||
        awayScore < 0
    ) {
        return {
            success: false,
            error: "Scores must be non-negative whole numbers.",
        };
    }

    const match = await db.orm.public.Match.first({
        id: matchId,
    });

    if (!match) {
        return {
            success: false,
            error: "Match not found.",
        };
    }

    const season = await db.orm.public.Season.first({
        id: match.seasonId,
    });

    if (!season) {
        return {
            success: false,
            error: "Season not found.",
        };
    }

    const permissions = await getLeaguePermissions(
        season.leagueId,
        season.id
    );

    if (
        !permissions.canManageMatch(
            match.homeTeamId,
            match.awayTeamId
        )
    ) {
        return {
            success: false,
            error: "You do not have permission to enter scores for this match.",
        };
    }

    try {
        await db.transaction(async (tx) => {

			const currentMatch = await tx.orm.public.Match.first({
				id: matchId,
			});

			if (!currentMatch) {
				throw new Error("Match not found.");
			}

			if (currentMatch.status === "cancelled") {
				throw new Error(
					"Cannot enter a score for a cancelled match."
				);
			}
			
			if (match.playoffSeriesId !== null) {
				const series = await tx.orm.public.PlayoffSeries.first({
					id: match.playoffSeriesId,
				});

				if (!series) {
					throw new Error("Playoff series not found.");
				}

				const seriesMatches = await tx.orm.public.Match
					.where({
						playoffSeriesId: series.id,
					})
					.all();

				const result = getPlayoffSeriesResult(
					series,
					seriesMatches
				);

				if (result.complete) {
					throw new Error(
						"This playoff series has already been decided."
					);
				}
			}

            await tx.orm.public.Match
                .where({ id: matchId })
                .update({
                    homeScore,
                    awayScore,
                    status: "completed",
                });

            if (match.playoffSeriesId !== null) {
                const series = await tx.orm.public.PlayoffSeries.first({
                    id: match.playoffSeriesId,
                });

                if (!series) {
                    throw new Error("Playoff series not found.");
                }

                const result = await completePlayoffSeries(
                    tx,
                    series.id
                );

                if (result.complete) {
                    await advancePlayoffRound(
                        tx,
                        match.seasonId,
                        series.round
                    );
                }
            }
        });
    } catch (error) {
        console.error("Failed to save match score:", error);

        return {
            success: false,
            error: "Unable to save match score.",
        };
    }

    revalidatePath("/leagues");

    return {
        success: true,
    };
}