import { db } from "@/src/prisma/db";

export async function getMatch(
    leagueSlug: string,
    matchId: number
) {
    const league = await db.orm.public.League.first({
        slug: leagueSlug,
    });

    if (!league) {
        return null;
    }

    const match = await db.orm.public.Match.first({
        id: matchId,
    });

    if (!match) {
        return null;
    }

    const seasonTeams = await db.orm.public.SeasonTeam
        .where({
            seasonId: match.seasonId,
        })
        .all();

    const seasonTeamsByTeamId = new Map(
        seasonTeams.map((seasonTeam) => [
            seasonTeam.teamId,
            seasonTeam,
        ])
    );

    const homeTeam = await db.orm.public.Team.first({
        id: match.homeTeamId,
    });

    const awayTeam = await db.orm.public.Team.first({
        id: match.awayTeamId,
    });

    if (!homeTeam || !awayTeam) {
        return null;
    }

    const lineups = await db.orm.public.MatchLineup
        .where({
            matchId: match.id,
        })
        .all();

    const rosterPlayers = await db.orm.public.RosterPlayer
        .where({
            seasonId: match.seasonId,
        })
        .all();

    const players = await db.orm.public.Player
        .where({
            leagueId: league.id,
        })
        .all();

    const playersById = new Map(
        players.map((player) => [player.id, player])
    );

    const rosterById = new Map(
        rosterPlayers.map((rosterPlayer) => [
            rosterPlayer.id,
            rosterPlayer,
        ])
    );

    function buildLineup(teamId: number) {
        return lineups
            .filter((lineupPlayer) => lineupPlayer.teamId === teamId)
            .sort((a, b) => a.position - b.position)
            .map((lineupPlayer) => {
                const rosterPlayer = rosterById.get(
                    lineupPlayer.rosterPlayerId
                );

                if (!rosterPlayer) {
                    return null;
                }

                const player = playersById.get(rosterPlayer.playerId);

                if (!player) {
                    return null;
                }

                return {
                    position: lineupPlayer.position,
                    rosterPlayerId: rosterPlayer.id,
                    playerId: player.id,
                    name: `${player.firstName} ${player.lastName}`,
                };
            })
            .filter((player) => player !== null);
    }

    const racks = (
        await db.orm.public.Rack
            .where({
                matchId: match.id,
            })
            .all()
    ).sort((a, b) => a.rackNumber - b.rackNumber);

    return {
        league,
        match,
        homeTeam: {
            ...homeTeam,
            playerStatsEnabled:
                seasonTeamsByTeamId.get(homeTeam.id)?.playerStatsEnabled ?? false,
        },
        awayTeam: {
        ...awayTeam,
        playerStatsEnabled:
            seasonTeamsByTeamId.get(awayTeam.id)?.playerStatsEnabled ?? false,
    },
        homeLineup: buildLineup(homeTeam.id),
        awayLineup: buildLineup(awayTeam.id),
        racks,
    };
}