import type {
	GeneratedSchedule,
	ScheduleTeam,
} from "./generateRoundRobinSchedule";

export type ScheduleValidationResult = {
	valid: boolean;
	errors: string[];
};

export function validateSchedule(
	schedule: GeneratedSchedule,
	teams: ScheduleTeam[]
): ScheduleValidationResult {
	const errors: string[] = [];

	const teamIds = new Set(
		teams.map((team) => team.id)
	);

	const teamNames = new Map(
		teams.map((team) => [
			team.id,
			team.name,
		])
	);

	const expectedRoundsPerHalf =
		teams.length % 2 === 0
			? teams.length - 1
			: teams.length;

	const expectedWeeks =
		expectedRoundsPerHalf * 2;

	const expectedMatchesPerTeam =
		(teams.length - 1) * 2;

	const expectedMatches =
		teams.length * (teams.length - 1);

	/*
	 * Overall schedule checks.
	 */
	if (schedule.weeks.length !== expectedWeeks) {
		errors.push(
			`Expected ${expectedWeeks} weeks, found ${schedule.weeks.length}.`
		);
	}

	const allMatches = schedule.weeks.flatMap(
		(week) => week.matches
	);

	if (allMatches.length !== expectedMatches) {
		errors.push(
			`Expected ${expectedMatches} matches, found ${allMatches.length}.`
		);
	}

	/*
	 * Per-team counters.
	 */
	const matchesPlayed = new Map<number, number>();
	const homeMatches = new Map<number, number>();
	const awayMatches = new Map<number, number>();
	const byes = new Map<number, number>();

	for (const team of teams) {
		matchesPlayed.set(team.id, 0);
		homeMatches.set(team.id, 0);
		awayMatches.set(team.id, 0);
		byes.set(team.id, 0);
	}

	/*
	 * Track every pairing.
	 *
	 * The key always uses the lower team ID first so
	 * A-v-B and B-v-A count as the same pairing.
	 */
	const pairings = new Map<
		string,
		{
			teamA: number;
			teamB: number;
			matches: {
				homeTeamId: number;
				awayTeamId: number;
			}[];
		}
	>();

	for (const week of schedule.weeks) {
		const teamsSeenThisWeek = new Set<number>();
        const homeVenuesThisWeek = new Map<number, number>();
		
        for (const match of week.matches) {
			if (!teamIds.has(match.homeTeamId)) {
				errors.push(
					`Week ${week.week} contains unknown home team ID ${match.homeTeamId}.`
				);
			}

			if (!teamIds.has(match.awayTeamId)) {
				errors.push(
					`Week ${week.week} contains unknown away team ID ${match.awayTeamId}.`
				);
			}

			if (
				match.homeTeamId ===
				match.awayTeamId
			) {
				errors.push(
					`Week ${week.week}: a team is scheduled to play itself.`
				);

				continue;
			}

			for (const teamId of [
				match.homeTeamId,
				match.awayTeamId,
			]) {
				if (
					teamsSeenThisWeek.has(teamId)
				) {
					errors.push(
						`Week ${week.week}: ${teamName(teamId, teamNames)} is scheduled more than once.`
					);
				}

				teamsSeenThisWeek.add(teamId);
			}

			matchesPlayed.set(
				match.homeTeamId,
				(matchesPlayed.get(
					match.homeTeamId
				) ?? 0) + 1
			);

			matchesPlayed.set(
				match.awayTeamId,
				(matchesPlayed.get(
					match.awayTeamId
				) ?? 0) + 1
			);

			homeMatches.set(
				match.homeTeamId,
				(homeMatches.get(
					match.homeTeamId
				) ?? 0) + 1
			);

			awayMatches.set(
				match.awayTeamId,
				(awayMatches.get(
					match.awayTeamId
				) ?? 0) + 1
			);

			const teamA = Math.min(
				match.homeTeamId,
				match.awayTeamId
			);

			const teamB = Math.max(
				match.homeTeamId,
				match.awayTeamId
			);

			const key = `${teamA}-${teamB}`;

			if (!pairings.has(key)) {
				pairings.set(key, {
					teamA,
					teamB,
					matches: [],
				});
			}

			pairings.get(key)!.matches.push({
				homeTeamId: match.homeTeamId,
				awayTeamId: match.awayTeamId,
			});

            const homeTeam = teams.find(
                (team) => team.id === match.homeTeamId
            );

            if (homeTeam?.venueId !== null && homeTeam?.venueId !== undefined) {
                const existingHomeTeamId = homeVenuesThisWeek.get(
                    homeTeam.venueId
                );

                if (existingHomeTeamId !== undefined) {
                    errors.push(
                        `Week ${week.week}: ${teamName(existingHomeTeamId, teamNames)} and ${homeTeam.name} are both scheduled at venue ${homeTeam.venueId}.`
                    );
                } else {
                    homeVenuesThisWeek.set(
                        homeTeam.venueId,
                        homeTeam.id
                    );
                }
            }
		}

		if (week.byeTeamId !== null) {
			if (!teamIds.has(week.byeTeamId)) {
				errors.push(
					`Week ${week.week} contains unknown bye team ID ${week.byeTeamId}.`
				);
			} else {
				byes.set(
					week.byeTeamId,
					(byes.get(
						week.byeTeamId
					) ?? 0) + 1
				);

				if (
					teamsSeenThisWeek.has(
						week.byeTeamId
					)
				) {
					errors.push(
						`Week ${week.week}: ${teamName(week.byeTeamId, teamNames)} has a bye but is also scheduled to play.`
					);
				}
			}
		}
	}

	/*
	 * Validate each team's totals.
	 */
	for (const team of teams) {
		const played =
			matchesPlayed.get(team.id) ?? 0;

		const home =
			homeMatches.get(team.id) ?? 0;

		const away =
			awayMatches.get(team.id) ?? 0;

		if (played !== expectedMatchesPerTeam) {
			errors.push(
				`${team.name} should play ${expectedMatchesPerTeam} matches, found ${played}.`
			);
		}

		/*
		 * In a mirrored double round robin every team
		 * should have the same number of home and away
		 * matches.
		 */
		const expectedHomeAway =
			teams.length - 1;

		if (home !== expectedHomeAway) {
			errors.push(
				`${team.name} should have ${expectedHomeAway} home matches, found ${home}.`
			);
		}

		if (away !== expectedHomeAway) {
			errors.push(
				`${team.name} should have ${expectedHomeAway} away matches, found ${away}.`
			);
		}

		const expectedByes =
			teams.length % 2 === 0
				? 0
				: 2;

		const byeCount =
			byes.get(team.id) ?? 0;

		if (byeCount !== expectedByes) {
			errors.push(
				`${team.name} should have ${expectedByes} byes, found ${byeCount}.`
			);
		}
	}

	/*
	 * Every pair must meet exactly twice, with each
	 * team hosting once.
	 */
	for (
		let i = 0;
		i < teams.length;
		i++
	) {
		for (
			let j = i + 1;
			j < teams.length;
			j++
		) {
			const teamA = teams[i];
			const teamB = teams[j];

			const key = [
				teamA.id,
				teamB.id,
			]
				.sort((a, b) => a - b)
				.join("-");

			const pairing =
				pairings.get(key);

			if (!pairing) {
				errors.push(
					`${teamA.name} and ${teamB.name} never play each other.`
				);

				continue;
			}

			if (pairing.matches.length !== 2) {
				errors.push(
					`${teamA.name} and ${teamB.name} should play twice, found ${pairing.matches.length}.`
				);

				continue;
			}

			const teamAHomeGames =
				pairing.matches.filter(
					(match) =>
						match.homeTeamId ===
						teamA.id
				).length;

			const teamBHomeGames =
				pairing.matches.filter(
					(match) =>
						match.homeTeamId ===
						teamB.id
				).length;

			if (
				teamAHomeGames !== 1 ||
				teamBHomeGames !== 1
			) {
				errors.push(
					`${teamA.name} and ${teamB.name} do not have a proper home-and-away series.`
				);
			}
		}
	}

	return {
		valid: errors.length === 0,
		errors,
	};
}

function teamName(
	teamId: number,
	teamNames: Map<number, string>
): string {
	return (
		teamNames.get(teamId) ??
		`Team ${teamId}`
	);
}