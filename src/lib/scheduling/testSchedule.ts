import {
	generateRoundRobinSchedule,
} from "./generateRoundRobinSchedule";
import {
	validateSchedule,
} from "./validateSchedule";

const teams = [
	{ id: 1, name: "Moose A", venueId: 1 },
	{ id: 2, name: "Moose B", venueId: 1 },
	{ id: 3, name: "Saxon A", venueId: 2 },
	{ id: 4, name: "Saxon B", venueId: 2 },
	{ id: 5, name: "Hunky A", venueId: 3 },
	{ id: 6, name: "Hunky B", venueId: 3 },
	{ id: 7, name: "VFW A", venueId: 4 },
	{ id: 8, name: "VFW B", venueId: 4 },
	{ id: 9, name: "SOI", venueId: 5 },
	{ id: 10, name: "Koppel", venueId: 6 },
	{ id: 11, name: "Chewton", venueId: 7 },
];

const teamNames = new Map(
	teams.map((team) => [
		team.id,
		team.name,
	])
);

const schedule = generateRoundRobinSchedule(
	teams,
	"2026-09-10"
);

for (const week of schedule.weeks) {
	console.log(
		`\nWEEK ${week.week} — ${week.date}`
	);

	for (const match of week.matches) {
		console.log(
			`  ${teamNames.get(match.awayTeamId)} @ ${teamNames.get(match.homeTeamId)}`
		);
	}

	if (week.byeTeamId) {
		console.log(
			`  BYE: ${teamNames.get(week.byeTeamId)}`
		);
	}
}

const validation = validateSchedule(
	schedule,
	teams
);

console.log("\n------------------------");
console.log("SCHEDULE VALIDATION");
console.log("------------------------");

if (validation.valid) {
	console.log("✓ Schedule is valid");
} else {
	console.log(
		`✗ Found ${validation.errors.length} problem(s):`
	);

	for (const error of validation.errors) {
		console.log(`  - ${error}`);
	}
}