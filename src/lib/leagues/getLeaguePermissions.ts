import "server-only";

import { auth } from "@/auth";
import { db } from "@/src/prisma/db";

function buildPermissions(
    isOwnerOrAdmin: boolean,
    captainTeamIds: number[]
) {
    return {
        isOwnerOrAdmin,
        captainTeamIds,

        canManageLineup: (teamId: number): boolean => {
            return (
                isOwnerOrAdmin ||
                captainTeamIds.includes(teamId)
            );
        },

        canManageMatch: (
            homeTeamId: number,
            awayTeamId: number
        ): boolean => {
            return (
                isOwnerOrAdmin ||
                captainTeamIds.includes(homeTeamId) ||
                captainTeamIds.includes(awayTeamId)
            );
        },
    };
}

export async function getLeaguePermissions(
    leagueId: number,
    seasonId: number
) {
    const session = await auth();

    if (!session?.user?.email) {
        return buildPermissions(false, []);
    }

    const user = await db.orm.public.User.first({
        email: session.user.email,
    });

    if (!user) {
        return buildPermissions(false, []);
    }

    const season = await db.orm.public.Season.first({
        id: seasonId,
        leagueId,
    });

    if (!season || !season.active) {
        return buildPermissions(false, []);
    }

    const membership = await db.orm.public.LeagueUser.first({
        leagueId,
        userId: user.id,
    });

    const isOwnerOrAdmin =
        membership?.role === "owner" ||
        membership?.role === "admin";

    const player = await db.orm.public.Player.first({
        leagueId,
        userId: user.id,
    });

    let captainTeamIds: number[] = [];

    if (player) {
        const captainRoster = await db.orm.public.RosterPlayer
            .where({
                seasonId,
                playerId: player.id,
                active: true,
            })
            .all();

        captainTeamIds = captainRoster
            .filter(
                (rosterPlayer) =>
                    rosterPlayer.captainPosition === "primary" ||
                    rosterPlayer.captainPosition === "co_captain"
            )
            .map((rosterPlayer) => rosterPlayer.teamId);
    }

    return buildPermissions(
        isOwnerOrAdmin,
        captainTeamIds
    );
}