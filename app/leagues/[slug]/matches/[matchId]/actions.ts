"use server";

import { auth } from "@/auth";
import { db } from "@/src/prisma/db";
import { revalidatePath } from "next/cache";

import { getLeaguePermissions } from "@/src/lib/leagues/getLeaguePermissions";

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

    const season = await db.orm.public.Season.first({
        id: match.seasonId,
        leagueId,
    });

    if (!season) {
        return {
            success: false,
            error: "Match does not belong to this league.",
        };
    }

    if (!season.active) {
        return {
            success: false,
            error: "Rack results cannot be edited for historical seasons.",
        };
    }

    const permissions = await getLeaguePermissions(
        leagueId,
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
            error: "You do not have permission to manage rack results.",
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

    const league = await db.orm.public.League.first({
        id: leagueId,
    });

    if(league) {
        revalidatePath(
            `/leagues/${league.slug}/matches/${matchId}`
        );
    }

    return {
        success: true,
    };
}