import { db } from "@/src/prisma/db";

export async function getRemovablePlayers(
    seasonId: number,
    teamId: number
): Promise<number[]> {
    const roster = await db.orm.public.RosterPlayer
        .where({
            seasonId,
            teamId,
        })
        .all();

    if (roster.length === 0) {
        return [];
    }

    const rosterPlayerIds = roster.map((player) => player.id);

    const lineups = await db.orm.public.MatchLineup
        .where((lineup) =>
            lineup.rosterPlayerId.in(rosterPlayerIds)
        )
        .all();

    const playedPlayerIds = new Set(
        lineups.map((lineup) => lineup.rosterPlayerId)
    );

    return rosterPlayerIds.filter(
        (id) => !playedPlayerIds.has(id)
    );
}