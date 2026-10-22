import { db } from "@/src/prisma/db";
import { Temporal } from "@js-temporal/polyfill";

export async function getLeagueTeam(
	leagueSlug: string,
	teamSlug: string,
	seasonSlug?: string
) {
	const league = await db.orm.public.League.first({
		slug: leagueSlug,
	});

	if (!league) {
		return null;
	}

	const team = await db.orm.public.Team.first({
		leagueId: league.id,
		slug: teamSlug,
	});

	if (!team) {
		return null;
	}

	const season = await db.orm.public.Season.first({
		leagueId: league.id,
    	...(seasonSlug
        	? { slug: seasonSlug }
        	: { active: true }),
	});

	const venue = team.venueId
		? await db.orm.public.Venue.first({
			id: team.venueId,
		})
		: null;

	if (!season) {
		return {
			league,
			team,
			venue,
			season: null,
			record: null,
			upcomingMatches: [],
			recentMatches: [],
		};
	}

	const seasons = await db.orm.public.Season
		.where({
			leagueId: league.id,
		})
		.all();

	const matches = await db.orm.public.Match
		.where({
			seasonId: season.id,
		})
		.all();

	const teams = await db.orm.public.Team
		.where({
			leagueId: league.id,
		})
		.all();

	const teamsById = new Map(
		teams.map((team) => [
			team.id,
			team,
		])
	);

	const teamMatches = matches.filter(
		(match) =>
			match.homeTeamId === team.id ||
			match.awayTeamId === team.id
	);

	let wins = 0;
	let losses = 0;
	let racksWon = 0;
	let racksLost = 0;

	for (const match of teamMatches) {
		if (
			match.status !== "completed" ||
			match.homeScore === null ||
			match.awayScore === null
		) {
			continue;
		}

		const isHome = match.homeTeamId === team.id;

		const teamScore = isHome
			? match.homeScore
			: match.awayScore;

		const opponentScore = isHome
			? match.awayScore
			: match.homeScore;

		racksWon += teamScore;
		racksLost += opponentScore;

		if (teamScore > opponentScore) {
			wins++;
		} else {
			losses++;
		}
	}

	const formatMatch = (match: typeof matches[number]) => {
		const isHome = match.homeTeamId === team.id;

		const opponentId = isHome
			? match.awayTeamId
			: match.homeTeamId;

		const opponent = teamsById.get(opponentId);

		if (!opponent) {
			return null;
		}

		return {
			id: match.id,
			week: match.week,
			scheduledAt: match.scheduledAt,
			status: match.status,
			isHome,
			opponent: {
				id: opponent.id,
				name: opponent.name,
				slug: opponent.slug,
			},
			teamScore: isHome
				? match.homeScore
				: match.awayScore,
			opponentScore: isHome
				? match.awayScore
				: match.homeScore,
		};
	};

	const formattedMatches = teamMatches
		.map(formatMatch)
		.filter((match) => match !== null);

	const upcomingMatches = formattedMatches
		.filter(
			(match) =>
				match.status === "scheduled" ||
				match.status === "postponed"
		)
		.sort(
			(a, b) => 
				Temporal.Instant.compare(
					a.scheduledAt,
					b.scheduledAt
				)
		);

	const recentMatches = formattedMatches
		.filter(
			(match) => match.status === "completed"
		)
		.sort(
			(a, b) => 
				Temporal.Instant.compare(
					b.scheduledAt,
					a.scheduledAt
				)
		);

	const played = wins + losses;
	const totalRacks = racksWon + racksLost;

	const rosterPlayers = await db.orm.public.RosterPlayer
		.where({
			seasonId: season.id,
			teamId: team.id
		})
		.include("player")
		.all();

	const roster = rosterPlayers.map(
		(rosterPlayer) => rosterPlayer.player
	);
	
	const seasonTeam = await db.orm.public.SeasonTeam.first({
		seasonId: season.id,
		teamId: team.id,
	});

	return {
		league,
		team,
		seasonTeam,
		venue,
		season,
		seasons,
		rosterPlayers,
		record: {
			played,
			wins,
			losses,
			racksWon,
			racksLost,
			matchPercentage: played
				? wins / played
				: 0,
			rackPercentage: totalRacks
				? racksWon / totalRacks
				: 0,
		},
		upcomingMatches,
		recentMatches,
	};
}