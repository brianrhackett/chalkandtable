import { db } from "@/src/prisma/db";

export async function getAvailablePlayers(
    leagueId: number,
    seasonId: number
) {
    const players = await db.orm.public.Player
        .where({
            leagueId,
            active: true,
        })
        .orderBy((player) => player.lastName.asc())
        .all();

    const rosterSpots = await db.orm.public.RosterPlayer
        .where({
            seasonId,
        })
        .all();

    const rosteredPlayerIds = new Set(
        rosterSpots.map((roster) => roster.playerId)
    );

    return players.filter(
        (player) => !rosteredPlayerIds.has(player.id)
    );
}