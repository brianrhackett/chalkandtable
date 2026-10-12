import { or } from "@prisma/orm-postgres/orm-client";

import { db } from "@/src/prisma/db";

export type PlayerStats = {
    rosterPlayerId: number;
    wins: number;
    losses: number;
};

export async function getPlayerStats(
    seasonId: number,
    teamId: number
): Promise<PlayerStats[]> {
    const matches = await db.orm.public.Match
        .where({ seasonId })
        .where((match) =>
            or(
                match.homeTeamId.eq(teamId),
                match.awayTeamId.eq(teamId)
            )
        )
        .orderBy((match) => match.scheduledAt.asc())
        .all();

    if (matches.length === 0) {
        return [];
    }

    const matchIds = matches.map((match) => match.id);

    const racks = await db.orm.public.Rack
        .where((rack) => rack.matchId.in(matchIds))
        .all();

    const lineups = await db.orm.public.MatchLineup
        .where({ teamId })
        .where((lineup) => lineup.matchId.in(matchIds))
        .orderBy((lineup) => lineup.position.asc())
        .all();

    const stats = new Map<number, PlayerStats>();

    for (const rack of racks) {
        const lineup = lineups.filter(
            (player) => player.matchId === rack.matchId
        );

        if (lineup.length === 0) {
            continue;
        }

        const playerIndexes = getPlayerIndexesForRack(
            rack.rackNumber,
            lineup.length
        );

        const players = playerIndexes.map(
            (index) => lineup[index]
        );

        const won = rack.winnerTeamId === teamId;

        for (const player of players) {
            const playerStats = stats.get(player.rosterPlayerId) ?? {
                rosterPlayerId: player.rosterPlayerId,
                wins: 0,
                losses: 0,
            };

            if (won) {
                playerStats.wins++;
            } else {
                playerStats.losses++;
            }

            stats.set(
                player.rosterPlayerId,
                playerStats
            );
        }
    }

    return Array.from(stats.values()).sort((a, b) => {
        if (b.wins !== a.wins) {
            return b.wins - a.wins;
        }

        return a.losses - b.losses;
    });
}

function getPlayerIndexesForRack(
    rackNumber: number,
    lineupSize: number
): [number, number] {
    const first = ((rackNumber - 1) * 2) % lineupSize;
    const second = (first + 1) % lineupSize;

    return [first, second];
}