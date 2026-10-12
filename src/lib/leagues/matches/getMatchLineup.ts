import { notFound } from "next/navigation";
import { db } from "@/src/prisma/db";

type GetMatchLineupParams = {
    leagueSlug: string;
    matchId: number;
    teamId: number;
};

export async function getMatchLineup({
    leagueSlug,
    matchId,
    teamId,
}: GetMatchLineupParams) {

    const league = await db.orm.public.League.first({
        slug: leagueSlug,
    });

    if (!league) {
        notFound();
    }

    const match = await db.orm.public.Match.first({
        id: matchId,
    });

    if (!match) {
        notFound();
    }

        const team = await db.orm.public.Team.first({
        id: teamId,
        leagueId: league.id,
    });

    if (!team) {
        notFound();
    }

    // The requested team must actually be playing in this match.
    if (
        match.homeTeamId !== team.id &&
        match.awayTeamId !== team.id
    ) {
        notFound();
    }

    const seasonTeam = await db.orm.public.SeasonTeam.first({
        seasonId: match.seasonId,
        teamId: team.id,
    });

    if (!seasonTeam || !seasonTeam.playerStatsEnabled) {
        notFound();
    }

    const roster = await db.orm.public.RosterPlayer
        .where({
            seasonId: match.seasonId,
            teamId: team.id,
            active: true,
        })
        .all();

    const players = await db.orm.public.Player
    .where({
        leagueId: league.id,
        active: true,
    })
    .all();

    const playersById = new Map(
        players.map((player) => [
            player.id,
            player,
        ])
    );

    const rosterPlayers = roster
        .map((rosterPlayer) => {
            const player = playersById.get(rosterPlayer.playerId);

            if (!player) {
                return null;
            }

            return {
                rosterPlayerId: rosterPlayer.id,
                playerId: player.id,
                firstName: player.firstName,
                lastName: player.lastName,
                name: `${player.firstName} ${player.lastName}`,
            };
        })
        .filter((player) => player !== null);

    const opponentTeamId = match.homeTeamId === team.id
                                ? match.awayTeamId
                                : match.homeTeamId;

    const opponent = await db.orm.public.Team.first({
        id: opponentTeamId,
    });

    if (!opponent) {
        notFound();
    }

    const isHomeTeam = match.homeTeamId === team.id;

    const homeTeam = isHomeTeam ? team : opponent;
    const awayTeam = isHomeTeam ? opponent : team;

    const lineup = (
        await db.orm.public.MatchLineup
            .where({
                matchId: match.id,
                teamId: team.id,
            })
            .all()
    ).sort((a, b) => a.position - b.position);

    // league
    // match
    // team
    // seasonTeam
    // roster
    // players
    // existing MatchLineup records

    return {
        league,
        match,
        team,
        homeTeam,
        awayTeam,
        roster: rosterPlayers,
        lineup,
    };
}