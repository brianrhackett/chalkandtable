import { db } from "@/src/prisma/db";

export type ScheduleMatch = {
	id: number;
	homeTeam: {
		id: number;
		name: string;
		slug: string;
		playerStatsEnabled: boolean;
	};
	awayTeam: {
		id: number;
		name: string;
		slug: string;
		playerStatsEnabled: boolean;
	};
	scheduledAt: string;
	status: string;
	homeScore: number | null;
	awayScore: number | null;
};

export type ScheduleWeek = {
    week: number | null;
    round: string | null;
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

	const playoffSeries = await db.orm.public.PlayoffSeries
		.where({ seasonId: season.id })
		.all();

	const seriesById = new Map(
		playoffSeries.map((series) => [
			series.id,
			series,
		])
	);

	const activeTeamIds = new Set(
		seasonTeams.map((seasonTeam) => seasonTeam.teamId)
	);

	const seasonTeamsByTeamId = new Map(
		seasonTeams.map((seasonTeam) => [
			seasonTeam.teamId,
			seasonTeam,
		])
	);

	const activeTeams = teams
		.filter((team) => activeTeamIds.has(team.id))
		.map((team) => ({
			...team,
			playerStatsEnabled: seasonTeamsByTeamId.get(team.id)!.playerStatsEnabled,
		}));

	const teamsById = new Map(
		activeTeams.map((team) => [
			team.id,
			team,
		])
	);

	type MatchGroup = {
		week: number | null;
		round: string | null;
		dateKey: string;
		matches: typeof matches;
	};

	const matchGroups = new Map<string, MatchGroup>();

	const dateFormatter = new Intl.DateTimeFormat("en-CA", {
		timeZone: "America/New_York",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	});

	for (const match of matches) {
		const round = match.playoffSeriesId
			? String(
				seriesById.get(match.playoffSeriesId)?.round ?? ""
			)
			: null;

		const dateKey = dateFormatter.format(
			new Date(String(match.scheduledAt))
		);

		const key = match.week === null
			? `playoff-${round}-${dateKey}`
			: `week-${match.week}`;

		if (!matchGroups.has(key)) {
			matchGroups.set(key, {
				week: match.week,
				round,
				dateKey,
				matches: [],
			});
		}

		matchGroups.get(key)!.matches.push(match);
	}

	const weeks: ScheduleWeek[] = [];

	for (const group of matchGroups.values()) {
		const participatingTeamIds = new Set<number>();
		const formattedMatches: ScheduleMatch[] = [];

		for (const match of group.matches) {
			const homeTeam = teamsById.get(match.homeTeamId);
			const awayTeam = teamsById.get(match.awayTeamId);

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
					playerStatsEnabled: homeTeam.playerStatsEnabled,
				},
				awayTeam: {
					id: awayTeam.id,
					name: awayTeam.name,
					slug: awayTeam.slug,
					playerStatsEnabled: awayTeam.playerStatsEnabled,
				},
				scheduledAt: String(match.scheduledAt),
				status: match.status,
				homeScore: match.homeScore,
				awayScore: match.awayScore,
			});
		}

		if (formattedMatches.length === 0) {
			continue;
		}

		const byeTeam = group.week !== null
			? activeTeams.find(
				(team) => !participatingTeamIds.has(team.id)
			) ?? null
			: null;

		weeks.push({
			week: group.week,
			round: group.round,
			date: String(group.matches[0].scheduledAt),
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
	
	weeks.sort(
		(a, b) =>
			Temporal.Instant.compare(a.date, b.date)
	);

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