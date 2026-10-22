"use server";

import { auth } from "@/auth";
import { db } from "@/src/prisma/db";

import { getLeaguePermissions } from "@/src/lib/leagues/getLeaguePermissions";

type SaveMatchLineupInput = {
    matchId: number;
    teamId: number;
    rosterPlayerIds: number[];
};

export async function saveMatchLineup({
    matchId,
    teamId,
    rosterPlayerIds,
}: SaveMatchLineupInput) {
    const session = await auth();

    if (!session?.user?.email) {
        return {
            success: false,
            error: "You must be signed in.",
        };
    }

    if (rosterPlayerIds.length === 0) {
        return {
            success: false,
            error: "Add at least one player to the lineup.",
        };
    }

    /*
     * Make sure the lineup doesn't contain the same
     * roster player more than once.
     */
    const uniquePlayerIds = new Set(rosterPlayerIds);

    if (uniquePlayerIds.size !== rosterPlayerIds.length) {
        return {
            success: false,
            error: "A player cannot appear more than once in the lineup.",
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

    if (match.status === "completed") {
        return {
            success: false,
            error: "Lineups cannot be edited after a match is completed.",
        };
    }

    /*
     * The team from the request must actually be
     * participating in this match.
     */
    if (
        match.homeTeamId !== teamId &&
        match.awayTeamId !== teamId
    ) {
        return {
            success: false,
            error: "This team is not participating in this match.",
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

    if (!season.active) {
        return {
            success: false,
            error: "Lineups cannot be edited for historical seasons.",
        };
    }

    const permissions = await getLeaguePermissions(
        season.leagueId,
        season.id
    );

    if (!permissions.canManageLineup(teamId)) {
        return {
            success: false,
            error: "You do not have permission to manage this lineup.",
        };
    }

    const seasonTeam = await db.orm.public.SeasonTeam.first({
        seasonId: match.seasonId,
        teamId,
    });

    if (!seasonTeam?.playerStatsEnabled) {
        return {
            success: false,
            error: "Player tracking is not enabled for this team.",
        };
    }

    /*
     * Verify every submitted rosterPlayerId actually
     * belongs to this team in this season.
     */
    const roster = await db.orm.public.RosterPlayer
        .where({
            seasonId: match.seasonId,
            teamId,
            active: true,
        })
        .all();

    const validRosterPlayerIds = new Set(
        roster.map((player) => player.id)
    );

    const invalidPlayer = rosterPlayerIds.some(
        (id) => !validRosterPlayerIds.has(id)
    );

    if (invalidPlayer) {
        return {
            success: false,
            error: "The lineup contains an invalid roster player.",
        };
    }
        
    const existingLineup = await db.orm.public.MatchLineup
        .where({
            matchId,
            teamId,
        })
        .all();

    for (const lineupPlayer of existingLineup) {
        await db.orm.public.MatchLineup
            .where({
                id: lineupPlayer.id,
            })
            .delete();
    }

    for (const [index, rosterPlayerId] of rosterPlayerIds.entries()) {
        await db.orm.public.MatchLineup.create({
            matchId,
            teamId,
            rosterPlayerId,
            position: index + 1,
        });
    }
    
    return {
        success: true,
    };
}