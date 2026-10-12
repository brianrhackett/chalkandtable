"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/src/prisma/db";

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