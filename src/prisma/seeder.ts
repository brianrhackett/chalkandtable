import { db } from "./db.ts";

const teams = [
	"Moose A",
	"Moose B",
	"Saxon A",
	"Saxon B",
	"Hunky A",
	"Hunky B",
	"VFW A",
	"VFW B",
	"SOI",
	"Koppel",
	"Chewton",
];

const venues: Record<string, string[]> = {
    "Moose Club": ["Moose A", "Moose B"],
    "Saxon Club": ["Saxon A", "Saxon B"],
    "Hungarian Club": ["Hunky A", "Hunky B"],
    "VFW": ["VFW A", "VFW B"],
    "Sons Of Italy": ["SOI"],
    "Koppel IMBS": ["Koppel"],
    "Chewton Polish White Eagles": ["Chewton"]
}

function slugify(value: string) {
	return value
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");
}

async function main() {
	const league = await db.orm.public.League.upsert({
		create: {
			name: "Ellwood City Pool League",
			slug: "ellwood-city-pool-league",
			playerStatsEnabled: false,
		},
		update: {},
		conflictOn: {
			slug: "ellwood-city-pool-league",
		},
	});

	const season = await db.orm.public.Season.upsert({
		create: {
			leagueId: league.id,
			name: "2026-2027",
			active: true,
		},
		update: {
			active: true,
		},
		conflictOn: {
            leagueId: league.id,
            name: "2026-2027",
		},
	});

	for (const [venueName, venueTeams] of Object.entries(venues)) {
        const venue = await db.orm.public.Venue.upsert({
            create: {
                leagueId: league.id,
                name: venueName,
            },
            update: {},
            conflictOn: {
                leagueId: league.id,
                name: venueName,
            },
        });

        for (const teamName of venueTeams) {
            const slug = slugify(teamName);

            const team = await db.orm.public.Team.upsert({
                create: {
                    leagueId: league.id,
                    venueId: venue.id,
                    name: teamName,
                    slug,
                },
                update: {
                    name: teamName,
                    venueId: venue.id,
                },
                conflictOn: {
                    leagueId: league.id,
                    slug,
                },
            });

            await db.orm.public.SeasonTeam.upsert({
                create: {
                    seasonId: season.id,
                    teamId: team.id,
                },
                update: {},
                conflictOn: {
                    seasonId: season.id,
                    teamId: team.id,
                },
            });
        }
    }

	console.log("Seed complete:");
	console.log(`League: ${league.name}`);
	console.log(`Season: ${season.name}`);
	console.log(`Teams: ${teams.length}`);

	await db.runtime().close();
}

main().catch(async (error) => {
	console.error(error);
	await db.runtime().close();
	process.exit(1);
});