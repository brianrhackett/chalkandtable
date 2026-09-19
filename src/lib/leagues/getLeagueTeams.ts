import { db } from "@/src/prisma/db";

export async function getLeagueTeams(slug: string) {
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
			teams: [],
		};
	}

	const seasonTeams = await db.orm.public.SeasonTeam
		.where({
			seasonId: season.id,
		})
		.all();

	const teams = await db.orm.public.Team
		.where({
			leagueId: league.id,
		})
		.all();

	const venues = await db.orm.public.Venue
		.where({
			leagueId: league.id,
		})
		.all();

	const matches = await db.orm.public.Match
		.where({
			seasonId: season.id,
			status: "completed",
		})
		.all();

	const activeTeamIds = new Set(
		seasonTeams.map((seasonTeam) => seasonTeam.teamId)
	);

	const activeTeams = teams
		.filter((team) => activeTeamIds.has(team.id))
		.map((team) => {
			const venue = venues.find(
				(venue) => venue.id === team.venueId
			);

			const teamMatches = matches.filter(
				(match) =>
					match.homeTeamId === team.id ||
					match.awayTeamId === team.id
			);

			let wins = 0;
			let losses = 0;

			for (const match of teamMatches) {
				const isHome = match.homeTeamId === team.id;

				const teamScore = isHome
					? match.homeScore
					: match.awayScore;

				const opponentScore = isHome
					? match.awayScore
					: match.homeScore;

				if (
					teamScore === null ||
					opponentScore === null
				) {
					continue;
				}

				if (teamScore > opponentScore) {
					wins++;
				} else if (teamScore < opponentScore) {
					losses++;
				}
			}

			const gamesPlayed = wins + losses;

			return {
				...team,
				venue: venue ?? null,
				wins,
				losses,
				percentage: gamesPlayed
					? wins / gamesPlayed
					: 0,
			};
		})
		.sort((a, b) => a.name.localeCompare(b.name));

	return {
		league,
		season,
		teams: activeTeams,
	};
}