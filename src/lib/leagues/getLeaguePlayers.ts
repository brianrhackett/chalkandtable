import { db } from "@/src/prisma/db";

export type LeaguePlayer = {
	id: number;
	name: string;
	team: {
		id: number;
		name: string;
		slug: string;
	};
};

export async function getLeaguePlayers(slug: string) {
	const league = await db.orm.public.League.first({
		slug,
	});

	if (!league) {
		return null;
	}

	const season = await db.orm.public.Season.first({
		leagueId: league.id,
		active: true,
	});

	if (!season) {
		return {
			league,
			season: null,
			players: [],
		};
	}

	const rosterPlayers = await db.orm.public.RosterPlayer
		.where({
			seasonId: season.id,
		})
		.all();

	const players = await db.orm.public.Player
		.where({
			leagueId: league.id,
		})
		.all();

	const teams = await db.orm.public.Team
		.where({
			leagueId: league.id,
		})
		.all();

	const playersById = new Map(
		players.map((player) => [
			player.id,
			player,
		])
	);

	const teamsById = new Map(
		teams.map((team) => [
			team.id,
			team,
		])
	);

	const leaguePlayers: LeaguePlayer[] = [];

	for (const rosterPlayer of rosterPlayers) {
		const player = playersById.get(
			rosterPlayer.playerId
		);

		const team = teamsById.get(
			rosterPlayer.teamId
		);

		if (!player || !team) {
			continue;
		}

		leaguePlayers.push({
			id: player.id,
			name: player.name,
			team: {
				id: team.id,
				name: team.name,
				slug: team.slug,
			},
		});
	}

	leaguePlayers.sort((a, b) =>
		a.name.localeCompare(b.name)
	);

	return {
		league,
		season,
		players: leaguePlayers,
	};
}