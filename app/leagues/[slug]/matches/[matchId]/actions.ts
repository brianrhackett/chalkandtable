"use server";

import { auth } from "@/auth";
import { db } from "@/src/prisma/db";
import { revalidatePath } from "next/cache";

type RackResult = {
    rackNumber: number;
    winnerTeamId: number;
};

export async function saveRackResults(
    leagueId: number,
    matchId: number,
    racks: RackResult[]
) {
    const session = await auth();

    if (!session?.user?.email) {
        return {
            success: false,
            error: "Unauthorized.",
        };
    }

    const user = await db.orm.public.User.first({
        email: session.user.email,
    });

    if (!user) {
        return {
            success: false,
            error: "Unauthorized.",
        };
    }

    const membership = await db.orm.public.LeagueUser
        .where({
            userId: user.id,
            leagueId,
        })
        .include("league")
        .first();

    if (!membership) {
        return {
            success: false,
            error: "You do not have access to this league.",
        };
    }

    const match = await db.orm.public.Match
        .where({
            id: matchId,
        })
        .first();

    if (!match) {
        return {
            success: false,
            error: "Match not found.",
        };
    }

    if (racks.length === 0) {
        return {
            success: false,
            error: "At least one rack is required.",
        };
    }

    const validTeamIds = [
        match.awayTeamId,
        match.homeTeamId,
    ];

    for (const rack of racks) {
        if (!validTeamIds.includes(rack.winnerTeamId)) {
            return {
                success: false,
                error: "Invalid rack winner.",
            };
        }
    }

    const existingRacks = await db.orm.public.Rack
        .where({
            matchId,
        })
        .all();

    for (const rack of existingRacks) {
        await db.orm.public.Rack
            .where({
                id: rack.id,
            })
            .delete();
    }

    for (const rack of racks) {
        await db.orm.public.Rack.create({
            matchId,
            rackNumber: rack.rackNumber,
            winnerTeamId: rack.winnerTeamId,
        });
    }

    revalidatePath(
        `/leagues/${membership.league.slug}/matches/${matchId}`
    );

    return {
        success: true,
    };
}