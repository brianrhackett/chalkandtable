export type ScheduleTeam = {
	id: number;
	name: string;
    venueId: number | null
};

export type GeneratedMatch = {
	week: number;
	homeTeamId: number;
	awayTeamId: number;
	scheduledAt: string;
};

export type GeneratedWeek = {
	week: number;
	date: string;
	byeTeamId: number | null;
	matches: GeneratedMatch[];
};

export type GeneratedSchedule = {
	weeks: GeneratedWeek[];
};

type ScheduleEntry = ScheduleTeam | null;

type Pairing = {
	teamA: ScheduleTeam;
	teamB: ScheduleTeam;
};

export type ScheduleFormat =
	| "single"
	| "home-away"
	| "fixed";

export type GenerateScheduleOptions = {
	startDate: string;
	excludedDates?: string[];
	format: ScheduleFormat;
	maxWeeks?: number | null;
};

/**
 * Generates a round-robin schedule.
 *
 * The first cycle is generated using the circle method.
 * Additional cycles repeat the same pairings, reversing
 * home/away on every other cycle.
 */
export function generateRoundRobinSchedule(
	teams: ScheduleTeam[],
	options: GenerateScheduleOptions
): GeneratedSchedule {
	const {
		startDate,
		excludedDates = [],
		format,
		maxWeeks = null,
	} = options;

	if (teams.length < 2) {
		throw new Error(
			"At least two teams are required to generate a schedule."
		);
	}

	const scheduleTeams: ScheduleEntry[] = shuffleTeams(teams);

	// The circle method requires an even number of entries.
	// null represents the BYE.
	if (scheduleTeams.length % 2 !== 0) {
		scheduleTeams.push(null);
	}

	const teamCount = scheduleTeams.length;
	const roundsPerCycle = teamCount - 1;
	const matchesPerRound = teamCount / 2;

	let totalWeeks: number;

	switch (format) {
		case "single":
			totalWeeks = roundsPerCycle;
			break;

		case "home-away":
			totalWeeks = roundsPerCycle * 2;
			break;

		case "fixed":
			if (!maxWeeks || maxWeeks < 1) {
				throw new Error(
					"A valid number of weeks is required for a fixed schedule."
				);
			}

			totalWeeks = maxWeeks;
			break;

		default:
			throw new Error(
				"Invalid schedule format."
			);
	}

	/*
	 * Generate one complete round-robin cycle.
	 *
	 * This is the only time we need to solve
	 * home/away assignments. Later cycles reuse
	 * these assignments and reverse them as needed.
	 */
	const rotation = [...scheduleTeams];

	type GeneratedRound = {
		byeTeamId: number | null;
		matches: AssignedMatch[];
	};

	const baseRounds: GeneratedRound[] = [];

	const homeCounts = new Map<number, number>();
	const awayCounts = new Map<number, number>();

	for (const team of teams) {
		homeCounts.set(team.id, 0);
		awayCounts.set(team.id, 0);
	}

	for (
		let round = 0;
		round < roundsPerCycle;
		round++
	) {
		const pairings: Pairing[] = [];
		let byeTeamId: number | null = null;

		for (
			let matchIndex = 0;
			matchIndex < matchesPerRound;
			matchIndex++
		) {
			const teamA = rotation[matchIndex];
			const teamB =
				rotation[teamCount - 1 - matchIndex];

			if (!teamA && teamB) {
				byeTeamId = teamB.id;
				continue;
			}

			if (teamA && !teamB) {
				byeTeamId = teamA.id;
				continue;
			}

			if (!teamA || !teamB) {
				continue;
			}

			pairings.push({
				teamA,
				teamB,
			});
		}

		const assignments = assignHomeAway(pairings, homeCounts, awayCounts);

		if (!assignments) {
			throw new Error(
				`Unable to find a valid home/away assignment for round ${round + 1}.`
			);
		}

		for (const assignment of assignments) {
			homeCounts.set(
				assignment.homeTeam.id,
				(homeCounts.get(assignment.homeTeam.id) ?? 0) + 1
			);

			awayCounts.set(
				assignment.awayTeam.id,
				(awayCounts.get(assignment.awayTeam.id) ?? 0) + 1
			);
		}

		baseRounds.push({
			byeTeamId,
			matches: assignments,
		});

		rotateTeams(rotation);
	}

	/*
	 * Turn those base rounds into however many
	 * actual weeks the selected format requires.
	 */
	const weeks: GeneratedWeek[] = [];

	let date = startDate;

	for (
		let weekIndex = 0;
		weekIndex < totalWeeks;
		weekIndex++
	) {
		const week = weekIndex + 1;

		const roundIndex =
			weekIndex % roundsPerCycle;

		const cycleIndex = Math.floor(
			weekIndex / roundsPerCycle
		);

		const reverseHomeAway =
			cycleIndex % 2 === 1;

		const baseRound =
			baseRounds[roundIndex];

		date = getNextPlayableDate(
			date,
			excludedDates,
			weekIndex === 0
		);

		const matches: GeneratedMatch[] =
			baseRound.matches.map(
				(assignment) => ({
					week,
					homeTeamId: reverseHomeAway
						? assignment.awayTeam.id
						: assignment.homeTeam.id,
					awayTeamId: reverseHomeAway
						? assignment.homeTeam.id
						: assignment.awayTeam.id,
					scheduledAt: date,
				})
			);

		weeks.push({
			week,
			date,
			byeTeamId:
				baseRound.byeTeamId,
			matches,
		});
	}

	return {
		weeks,
	};
}

/**
 * Circle-method rotation.
 *
 * The first entry stays fixed while the remaining
 * entries rotate around it.
 */
function rotateTeams(
	teams: ScheduleEntry[]
): void {
	const fixed = teams[0];
	const rotating = teams.slice(1);

	rotating.unshift(rotating.pop()!);

	teams.splice(
		0,
		teams.length,
		fixed,
		...rotating
	);
}

/**
 * Returns the next playable league date.
 *
 * Excluded dates are skipped and do not count
 * toward the number of scheduled weeks.
 */
function getNextPlayableDate(
	currentDate: string,
	excludedDates: string[],
	isFirstWeek: boolean
): string {
	const excluded = new Set(excludedDates);

	let date = isFirstWeek
		? currentDate
		: addDays(currentDate, 7);

	while (excluded.has(date)) {
		date = addDays(date, 7);
	}

	return date;
}

function addDays(
	dateString: string,
	days: number
): string {
	const date = new Date(
		`${dateString}T00:00:00Z`
	);

	date.setUTCDate(
		date.getUTCDate() + days
	);

	return date.toISOString().slice(0, 10);
}


function shuffleTeams(
	teams: ScheduleTeam[]
): ScheduleTeam[] {
	const shuffled = [...teams];

	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(
			Math.random() * (i + 1)
		);

		[
			shuffled[i],
			shuffled[j],
		] = [
			shuffled[j],
			shuffled[i],
		];
	}

	return shuffled;
}

type AssignedMatch = {
	homeTeam: ScheduleTeam;
	awayTeam: ScheduleTeam;
};

function assignHomeAway(
	pairings: Pairing[],
	homeCounts: Map<number, number>,
	awayCounts: Map<number, number>
): AssignedMatch[] | null {
	const assignments: AssignedMatch[] = [];

	function solve(index: number): boolean {
		if (index === pairings.length) {
			return hasValidVenueAssignments(
				assignments
			);
		}

		const pairing = pairings[index];

		const teamABalance =
			(homeCounts.get(pairing.teamA.id) ?? 0) -
			(awayCounts.get(pairing.teamA.id) ?? 0);

		const teamBBalance =
			(homeCounts.get(pairing.teamB.id) ?? 0) -
			(awayCounts.get(pairing.teamB.id) ?? 0);

		/*
		* Prefer putting the team with fewer previous
		* home matches at home.
		*/
		const options: AssignedMatch[] =
			teamABalance <= teamBBalance
				? [
					{
						homeTeam: pairing.teamA,
						awayTeam: pairing.teamB,
					},
					{
						homeTeam: pairing.teamB,
						awayTeam: pairing.teamA,
					},
				]
				: [
					{
						homeTeam: pairing.teamB,
						awayTeam: pairing.teamA,
					},
					{
						homeTeam: pairing.teamA,
						awayTeam: pairing.teamB,
					},
				];


		for (const option of options) {
			assignments.push(option);

			if (
				canStillSatisfyVenueConstraints(
					assignments,
					pairings,
					index + 1
				) &&
				solve(index + 1)
			) {
				return true;
			}

			assignments.pop();
		}

		return false;
	}

	if (!solve(0)) {
		return null;
	}

	return [...assignments];
}

function hasValidVenueAssignments(
	assignments: AssignedMatch[]
): boolean {
	const teamSides = new Map<
		number,
		"home" | "away"
	>();

	for (const assignment of assignments) {
		teamSides.set(
			assignment.homeTeam.id,
			"home"
		);

		teamSides.set(
			assignment.awayTeam.id,
			"away"
		);
	}

	const teams = assignments.flatMap(
		(assignment) => [
			assignment.homeTeam,
			assignment.awayTeam,
		]
	);

	for (let i = 0; i < teams.length; i++) {
		for (
			let j = i + 1;
			j < teams.length;
			j++
		) {
			const teamA = teams[i];
			const teamB = teams[j];

			if (
				teamA.venueId === null ||
				teamB.venueId === null
			) {
				continue;
			}

			if (
				teamA.venueId !==
				teamB.venueId
			) {
				continue;
			}

			/*
			 * Teams sharing a venue must be on
			 * opposite sides this week.
			 *
			 * This also guarantees that the mirrored
			 * week remains valid.
			 */
			if (
				teamSides.get(teamA.id) ===
				teamSides.get(teamB.id)
			) {
				return false;
			}
		}
	}

	return true;
}

function canStillSatisfyVenueConstraints(
	assignments: AssignedMatch[],
	pairings: Pairing[],
	nextPairingIndex: number
): boolean {
	const assignedSides = new Map<
		number,
		"home" | "away"
	>();

	for (const assignment of assignments) {
		assignedSides.set(
			assignment.homeTeam.id,
			"home"
		);

		assignedSides.set(
			assignment.awayTeam.id,
			"away"
		);
	}

	const allTeams = pairings.flatMap(
		(pairing) => [
			pairing.teamA,
			pairing.teamB,
		]
	);

	for (const team of allTeams) {
		const side =
			assignedSides.get(team.id);

		if (!side || team.venueId === null) {
			continue;
		}

		for (const otherTeam of allTeams) {
			if (
				otherTeam.id === team.id ||
				otherTeam.venueId !==
					team.venueId
			) {
				continue;
			}

			const otherSide =
				assignedSides.get(
					otherTeam.id
				);

			if (
				otherSide &&
				otherSide === side
			) {
				return false;
			}
		}
	}

	return true;
}