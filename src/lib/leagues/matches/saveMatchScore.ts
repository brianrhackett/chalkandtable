"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/src/prisma/db";
import { getLeaguePermissions } from "@/src/lib/leagues/getLeaguePermissions";

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

    await db.orm.public.Match
        .where({
            id: matchId,
        })
        .update({
            homeScore,
            awayScore,
            status: "completed",
        });

    revalidatePath("/leagues");

    return {
        success: true,
    };
}