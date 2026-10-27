import { db } from "@/src/prisma/db";
import { rankStandings } from "./rankStandings";
import { isRegularSeasonComplete } from "./isRegularSeasonComplete";

export type LeagueStanding = {
	teamId: number;
	name: string;
	slug: string;
	played: number;
	wins: number;
	losses: number;
	matchPercentage: number;
	racksWon: number;
	racksLost: number;
	rackPercentage: number;
	rank: number;
};

export async function getLeagueStandings(
	slug: string,
	seasonSlug?: string
) {
	const league = await db.orm.public.League.first({
		slug,
	});

	if (!league) {
		return null;
	}

	const season = await db.orm.public.Season.first({
		leagueId: league.id,
    	...(seasonSlug
        	? { slug: seasonSlug }
        	: { active: true }),
	});

	if (!season) {
		return {
			league,
			season: null,
			standings: [],
		};
	}

	const playoffs = await db.orm.public.Playoff.first({
		seasonId: season.id
	});

	const seasons = await db.orm.public.Season
		.where({
			leagueId: league.id,
		})
		.all();

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

	const matches = await db.orm.public.Match
		.where({
			seasonId: season.id,
			status: "completed",
		})
		.where((match) => match.week.isNotNull())
		.all();

	const activeTeamIds = new Set(
		seasonTeams.map((seasonTeam) => seasonTeam.teamId)
	);

	const standings: LeagueStanding[] = teams
		.filter((team) => activeTeamIds.has(team.id))
		.map((team) => {
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

			const played = wins + losses;
			const totalRacks = racksWon + racksLost;

			return {
				teamId: team.id,
				name: team.name,
				slug: team.slug,
				played,
				wins,
				losses,
				matchPercentage: played
					? wins / played
					: 0,
				racksWon,
				racksLost,
				rackPercentage: totalRacks
					? racksWon / totalRacks
					: 0,
			};
		});

	
    const rankedStandings = rankStandings(
	    standings,
	    matches
    );

	const regularSeasonComplete = await isRegularSeasonComplete(season.id);

	return {
		league,
		season,
		seasons,
		standings: rankedStandings,
		playoffTeamCount: playoffs?.teamCount ?? null,
		regularSeasonComplete,
 	};
}