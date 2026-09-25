import { db } from "@/src/prisma/db";

export type ScheduleMatch = {
	id: number;
	homeTeam: {
		id: number;
		name: string;
		slug: string;
	};
	awayTeam: {
		id: number;
		name: string;
		slug: string;
	};
	scheduledAt: string;
	status: string;
	homeScore: number | null;
	awayScore: number | null;
};

export type ScheduleWeek = {
	week: number;
	date: string;
	matches: ScheduleMatch[];
	byeTeam: {
		id: number;
		name: string;
		slug: string;
	} | null;
};

export type ScheduleView =
	| "upcoming"
	| "past"
	| "all";

export async function getLeagueSchedule(
    slug: string,
    view: ScheduleView = "upcoming",
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
			weeks: [],
		};
	}

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
		})
		.all();

	const activeTeamIds = new Set(
		seasonTeams.map((seasonTeam) => seasonTeam.teamId)
	);

	const activeTeams = teams.filter(
		(team) => activeTeamIds.has(team.id)
	);

	const teamsById = new Map(
		activeTeams.map((team) => [
			team.id,
			team,
		])
	);

	const matchesByWeek = new Map<
		number,
		typeof matches
	>();

	for (const match of matches) {
		const weekMatches =
			matchesByWeek.get(match.week) ?? [];

		weekMatches.push(match);

		matchesByWeek.set(
			match.week,
			weekMatches
		);
	}

	const weeks: ScheduleWeek[] = [];

	for (const [week, weekMatches] of matchesByWeek) {
		const participatingTeamIds = new Set<number>();

		const formattedMatches: ScheduleMatch[] = [];

		for (const match of weekMatches) {
			const homeTeam = teamsById.get(
				match.homeTeamId
			);

			const awayTeam = teamsById.get(
				match.awayTeamId
			);

			if (!homeTeam || !awayTeam) {
				continue;
			}

			participatingTeamIds.add(homeTeam.id);
			participatingTeamIds.add(awayTeam.id);

			formattedMatches.push({
				id: match.id,
				homeTeam: {
					id: homeTeam.id,
					name: homeTeam.name,
					slug: homeTeam.slug,
				},
				awayTeam: {
					id: awayTeam.id,
					name: awayTeam.name,
					slug: awayTeam.slug,
				},
				scheduledAt: match.scheduledAt,
				status: match.status,
				homeScore: match.homeScore,
				awayScore: match.awayScore,
			});
		}

		const byeTeam =
			activeTeams.find(
				(team) =>
					!participatingTeamIds.has(team.id)
			) ?? null;

		const firstMatch = weekMatches[0];

		weeks.push({
			week,
			date: firstMatch.scheduledAt,
			matches: formattedMatches,
			byeTeam: byeTeam
				? {
					id: byeTeam.id,
					name: byeTeam.name,
					slug: byeTeam.slug,
				}
				: null,
		});
	}

	weeks.sort((a, b) => a.week - b.week);

    let filteredWeeks = weeks;

    if( view === 'upcoming' ) {
        filteredWeeks = weeks
            .map((week) => ({
                ...week,
                matches: week.matches.filter(
                    (match) =>
                        match.status === "scheduled" ||
                        match.status === "postponed"
                ),
            }))
            .filter((week) => week.matches.length > 0);
    }

    if( view === 'past' ) {
        filteredWeeks = weeks
            .map((week) => ({
                ...week,
                matches: week.matches.filter(
                    (match) =>
                        match.status === "completed"
                ),
            }))
            .filter((week) => week.matches.length > 0)
            .reverse();
    }
    
	return {
		league,
		season,
		seasons,
		weeks: filteredWeeks,
	};
}