"use server";

import sanitizeHtml from "sanitize-html";
import { auth } from "@/auth";
import { db } from "@/src/prisma/db";
import { canManageLeague } from "@/src/lib/permissions/league";
import { themes, type ThemeKey } from "@/src/lib/themes";
import { revalidatePath } from "next/cache";
import { Temporal } from "@js-temporal/polyfill";

export type LeagueSettingsState = {
	error: string | null;
	success: boolean;
};

import type {
	GeneratedSchedule,
} from "@/src/lib/scheduler/generateRoundRobinSchedule";

function makeSlug(value: string) {
	return value
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

export async function updateLeagueSettings(
	leagueId: number,
	previousState: LeagueSettingsState,
	formData: FormData
): Promise<LeagueSettingsState> {
	const session = await auth();

	if (!session?.user?.email) {
		return {
			error: "You must be signed in.",
			success: false,
		};
	}

	const name = formData.get("name")?.toString().trim() ?? "";
	const slug = formData.get("slug")?.toString().trim().toLowerCase() ?? "";
	const theme = formData.get("theme")?.toString() ?? "";
	const playerStatsEnabled = formData.get("playerStatsEnabled") === "on";

	if (!name || !slug) {
		return {
			error: "League name and URL are required.",
			success: false,
		};
	}

	if (!(theme in themes)) {
		return {
			error: "Please select a valid theme.",
			success: false,
		};
	}

	const user = await db.orm.public.User.first({
		email: session.user.email,
	});

	if (!user) {
		return {
			error: "User not found.",
			success: false,
		};
	}

    const memberships = await db.orm.public.LeagueUser
        .where({
            userId: user.id,
            leagueId,
        })
        .all();

    const membership = memberships[0];

    if (!membership || !canManageLeague(membership.role)) {
        return {
            error: "You do not have permission to manage this league.",
            success: false,
        };
    }

    await db.orm.public.League.update({
        id: leagueId,
        name,
        slug,
        theme: theme as ThemeKey,
        playerStatsEnabled,
    });

    revalidatePath("/dashboard");
    revalidatePath(`/leagues/${slug}`);
    revalidatePath(`/leagues/${slug}/settings`);

	return {
		error: null,
		success: true,
	};
}

export type RulesState = {
	success: boolean;
	message: string;
};

export async function updateSeasonRules(
	seasonId: number,
	rules: string
): Promise<RulesState> {
	const session = await auth();

	if (!session?.user?.email) {
		return {
			success: false,
			message: "You must be signed in.",
		};
	}

	const user = await db.orm.public.User.first({
		email: session.user.email,
	});

	if (!user) {
		return {
			success: false,
			message: "User not found.",
		};
	}

	const season = await db.orm.public.Season.first({
		id: seasonId,
	});

	if (!season) {
		return {
			success: false,
			message: "Season not found.",
		};
	}

	const memberships = await db.orm.public.LeagueUser
		.where({
			userId: user.id,
			leagueId: season.leagueId,
		})
		.all();

	const membership = memberships[0];

	if (
		!membership ||
		!canManageLeague(membership.role)
	) {
		return {
			success: false,
			message: "You do not have permission to edit these rules.",
		};
	}

	const sanitizedRules = sanitizeHtml(rules, {
		allowedTags: [
			"p",
			"h2",
			"h3",
			"strong",
			"em",
			"ul",
			"ol",
			"li",
			"br",
		],
		allowedAttributes: {},
	});

	await db.orm.public.Season.update({
		id: season.id,
		rules: sanitizedRules,
	});

	const league = await db.orm.public.League.first({
		id: season.leagueId,
	});

	if (league) {
		revalidatePath(
			`/leagues/${league.slug}/settings`
		);

		revalidatePath(
			`/leagues/${league.slug}/rules`
		);
	}

	return {
		success: true,
		message: "Rules saved.",
	};
}


export async function updateVenue(
	venueId: number,
	name: string,
	leagueId: number
) {
	const session = await auth();
	
	if (!session?.user?.email) {
		return {
			success: false,
			error: "Unauthorized.",
		};
	}

	const user = await db.orm.public.User.first({
		email: session.user.email,
	});

	if (!user) {
		return {
			success: false,
			error: "Unauthorized.",
		};
	}

	const trimmedName = name.trim();

	if (!trimmedName) {
		return {
			success: false,
			error: "Venue name is required.",
		};
	}

	const membership = await db.orm.public.LeagueUser
		.where({
			userId: user.id,
			leagueId,
		})
		.include("league")
		.first();

	if (
		!membership ||
		!["owner", "admin"].includes(membership.role)
	) {
		return {
			success: false,
			error: "You do not have permission to edit this league.",
		};
	}

	const venue = await db.orm.public.Venue
		.where({
			id: venueId,
			leagueId: leagueId,
		})
		.first();

	if (!venue) {
		return {
			success: false,
			error: "Venue not found.",
		};
	}

	await db.orm.public.Venue
		.where({
			id: venueId,
		})
		.update({
			name: trimmedName,
		});

	revalidatePath(`/leagues/${membership.league.slug}/settings`);

	return {
		success: true,
	};
}

export async function createVenue(
	name: string,
	leagueId: number
) {
	const session = await auth();

	if (!session?.user?.email) {
		return {
			success: false,
			error: "Unauthorized.",
		};
	}

	const user = await db.orm.public.User.first({
		email: session.user.email,
	});

	if (!user) {
		return {
			success: false,
			error: "Unauthorized.",
		};
	}

	const trimmedName = name.trim();

	if (!trimmedName) {
		return {
			success: false,
			error: "Venue name is required.",
		};
	}

	const membership = await db.orm.public.LeagueUser
		.where({
			userId: user.id,
			leagueId,
		})
		.include("league")
		.first();

	if (
		!membership ||
		!["owner", "admin"].includes(membership.role)
	) {
		return {
			success: false,
			error: "You do not have permission to edit this league.",
		};
	}

	await db.orm.public.Venue.create({
		leagueId,
		name: trimmedName,
	});

	revalidatePath(`/leagues/${membership.league.slug}/settings`);

	return {
		success: true,
	};
}

export async function deleteVenue(
	venueId: number,
	leagueId: number
) {
	const session = await auth();

	if (!session?.user?.email) {
		return {
			success: false,
			error: "Unauthorized.",
		};
	}

	const user = await db.orm.public.User.first({
		email: session.user.email,
	});

	if (!user) {
		return {
			success: false,
			error: "Unauthorized.",
		};
	}

	const membership = await db.orm.public.LeagueUser
		.where({
			userId: user.id,
			leagueId,
		})
		.include("league")
		.first();

	if (
		!membership ||
		!["owner", "admin"].includes(membership.role)
	) {
		return {
			success: false,
			error: "You do not have permission to edit this league.",
		};
	}

	const venue = await db.orm.public.Venue
		.where({
			id: venueId,
			leagueId,
		})
		.first();

	if (!venue) {
		return {
			success: false,
			error: "Venue not found.",
		};
	}

	const team = await db.orm.public.Team
		.where({
			venueId,
		})
		.first();

	if (team) {
		return {
			success: false,
			error: "This venue is still assigned to one or more teams.",
		};
	}

	await db.orm.public.Venue
		.where({
			id: venueId,
			leagueId,
		})
		.delete();

	revalidatePath(`/leagues/${membership.league.slug}/settings`);

	return {
		success: true,
	};
}

export async function updateTeam(
	teamId: number,
	name: string,
	venueId: number,
	leagueId: number
) {
	const session = await auth();

	if (!session?.user?.email) {
		return {
			success: false,
			error: "Unauthorized.",
		};
	}

	const user = await db.orm.public.User.first({
		email: session.user.email,
	});

	if (!user) {
		return {
			success: false,
			error: "Unauthorized.",
		};
	}

	const trimmedName = name.trim();

	if (!trimmedName) {
		return {
			success: false,
			error: "Team name is required.",
		};
	}

	const membership = await db.orm.public.LeagueUser
		.where({
			userId: user.id,
			leagueId,
		})
		.include("league")
		.first();

	if (
		!membership ||
		!["owner", "admin"].includes(membership.role)
	) {
		return {
			success: false,
			error: "You do not have permission to edit this league.",
		};
	}

	const team = await db.orm.public.Team
		.where({
			id: teamId,
			leagueId,
		})
		.first();

	if (!team) {
		return {
			success: false,
			error: "Team not found.",
		};
	}

	const venue = await db.orm.public.Venue
		.where({
			id: venueId,
			leagueId,
		})
		.first();

	if (!venue) {
		return {
			success: false,
			error: "Venue not found.",
		};
	}

	await db.orm.public.Team
		.where({
			id: teamId,
			leagueId,
		})
		.update({
			name: trimmedName,
			venueId,
		});

	revalidatePath(`/leagues/${membership.league.slug}/settings`);

	return {
		success: true,
	};
}

export async function createTeam(
	name: string,
	venueId: number,
	leagueId: number,
	seasonId: number
) {
	const session = await auth();

	if (!session?.user?.email) {
		return {
			success: false,
			error: "Unauthorized.",
		};
	}

	const user = await db.orm.public.User.first({
		email: session.user.email,
	});

	if (!user) {
		return {
			success: false,
			error: "Unauthorized.",
		};
	}

	const trimmedName = name.trim();

	if (!trimmedName) {
		return {
			success: false,
			error: "Team name is required.",
		};
	}

	const slug = makeSlug(trimmedName);

	const membership = await db.orm.public.LeagueUser
		.where({
			userId: user.id,
			leagueId,
		})
		.include("league")
		.first();

	if (
		!membership ||
		!["owner", "admin"].includes(membership.role)
	) {
		return {
			success: false,
			error: "You do not have permission to edit this league.",
		};
	}

	// Make sure the season actually belongs to this league.
	const season = await db.orm.public.Season
		.where({
			id: seasonId,
			leagueId,
		})
		.first();

	if (!season) {
		return {
			success: false,
			error: "Season not found.",
		};
	}

	// Make sure they didn't send us a venue from another league.
	const venue = await db.orm.public.Venue
		.where({
			id: venueId,
			leagueId,
		})
		.first();

	if (!venue) {
		return {
			success: false,
			error: "Venue not found.",
		};
	}

	const team = await db.orm.public.Team.create({
		leagueId,
		venueId,
		name: trimmedName,
		slug,
	});

	await db.orm.public.SeasonTeam.create({
		seasonId,
		teamId: team.id,
	});

	revalidatePath(`/leagues/${membership.league.slug}/settings`);

	return {
		success: true,
	};
}

export async function removeTeamFromSeason(
	teamId: number,
	seasonId: number,
	leagueId: number
) {
	const session = await auth();

	if (!session?.user?.email) {
		return {
			success: false,
			error: "Unauthorized.",
		};
	}

	const user = await db.orm.public.User.first({
		email: session.user.email,
	});

	if (!user) {
		return {
			success: false,
			error: "Unauthorized.",
		};
	}

	const membership = await db.orm.public.LeagueUser
		.where({
			userId: user.id,
			leagueId,
		})
		.include("league")
		.first();

	if (
		!membership ||
		!["owner", "admin"].includes(membership.role)
	) {
		return {
			success: false,
			error: "You do not have permission to edit this league.",
		};
	}

	const season = await db.orm.public.Season
		.where({
			id: seasonId,
			leagueId,
		})
		.first();

	if (!season) {
		return {
			success: false,
			error: "Season not found.",
		};
	}

	const seasonTeam = await db.orm.public.SeasonTeam
		.where({
			seasonId,
			teamId,
		})
		.first();

	if (!seasonTeam) {
		return {
			success: false,
			error: "Team is not part of this season.",
		};
	}

	await db.orm.public.SeasonTeam
		.where({
			seasonId,
			teamId,
		})
		.delete();

	revalidatePath(`/leagues/${membership.league.slug}/settings`);

	return {
		success: true,
	};
}


export async function saveSchedule(
	leagueId: number,
	seasonId: number,
	schedule: GeneratedSchedule
) {
	const session = await auth();

	if (!session?.user?.email) {
		return {
			success: false,
			error: "Unauthorized.",
		};
	}

	const user = await db.orm.public.User.first({
		email: session.user.email,
	});

	if (!user) {
		return {
			success: false,
			error: "Unauthorized.",
		};
	}

	const membership = await db.orm.public.LeagueUser
		.where({
			userId: user.id,
			leagueId,
		})
		.include("league")
		.first();

	if (
		!membership ||
		!["owner", "admin"].includes(membership.role)
	) {
		return {
			success: false,
			error: "You do not have permission to edit this league.",
		};
	}

	const season = await db.orm.public.Season
		.where({
			id: seasonId,
			leagueId,
		})
		.first();

	if (!season) {
		return {
			success: false,
			error: "Season not found.",
		};
	}

	const matches = schedule.weeks.flatMap(
		(week) =>
			week.matches.map((match) => ({
				seasonId,
				week: week.week,
				homeTeamId: match.homeTeamId,
				awayTeamId: match.awayTeamId,
				scheduledAt: Temporal.Instant.from(
					`${match.scheduledAt}T00:00:00Z`
				),
			}))
	);

	if (matches.length === 0) {
		return {
			success: false,
			error: "The schedule contains no matches.",
		};
	}

	for (const match of matches) {
		await db.orm.public.Match.create(match);
	}

	revalidatePath(
		`/leagues/${membership.league.slug}/settings`
	);

	return {
		success: true,
	};
}