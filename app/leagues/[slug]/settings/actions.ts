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

    await db.orm.public.League
		.where({
			id: leagueId,
		})
		.update({
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

	await db.orm.public.Season
		.where({
			id: seasonId,
		})
		.update({
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
				scheduledAt: Temporal.PlainDate.from(match.scheduledAt)
					.toZonedDateTime({
						timeZone: "America/New_York",
						plainTime: Temporal.PlainTime.from("12:00"),
					})
					.toInstant(),
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



type PlayoffConfigurationInput = {
    teamCount: number;
    reseed: boolean;
    rounds: {
        round: number;
        name: string;
        bestOf: number;
    }[];
};

export async function savePlayoffConfiguration(
    leagueId: number,
    seasonId: number,
    configuration: PlayoffConfigurationInput
) {
    const session = await auth();

    if (!session?.user?.email) {
        return {
            success: false,
            error: "You must be signed in.",
        };
    }

    const user = await db.orm.public.User.first({
        email: session.user.email,
    });

    if (!user) {
        return {
            success: false,
            error: "User not found.",
        };
    }

    const season = await db.orm.public.Season.first({
        id: seasonId,
        leagueId,
    });

    if (!season) {
        return {
            success: false,
            error: "Season not found.",
        };
    }

    const memberships = await db.orm.public.LeagueUser
        .where({
            userId: user.id,
            leagueId,
        })
        .all();

    const membership = memberships[0];

    if (
        !membership ||
        !canManageLeague(membership.role)
    ) {
        return {
            success: false,
            error: "You do not have permission to configure playoffs.",
        };
    }

    if (
        configuration.teamCount < 2 ||
        configuration.rounds.length === 0
    ) {
        return {
            success: false,
            error: "Invalid playoff configuration.",
        };
    }

    if (
        configuration.rounds.some(
            (round) =>
                round.bestOf < 1 ||
                round.bestOf % 2 === 0
        )
    ) {
        return {
            success: false,
            error: "Each playoff round must use an odd number of matches.",
        };
    }

    const existingPlayoff = await db.orm.public.Playoff.first({
		seasonId,
	});

	let playoff;

	if (existingPlayoff) {
		playoff = await db.orm.public.Playoff
			.where({
				id: existingPlayoff.id,
			})
			.update({
				
				teamCount: configuration.teamCount,
				reseed: configuration.reseed,
			});

		const existingRounds =
			await db.orm.public.PlayoffRoundConfig
				.where({
					playoffId: playoff.id,
				})
				.all();

		for (const round of existingRounds) {
			await db.orm.public.PlayoffRoundConfig.where({
				id: round.id,
			}).delete();
		}
	} else {
		playoff = await db.orm.public.Playoff.create({
			seasonId,
			teamCount: configuration.teamCount,
			reseed: configuration.reseed,
		});
	}

    for (const round of configuration.rounds) {
        await db.orm.public.PlayoffRoundConfig.create({
            playoffId: playoff.id,
            round: round.round,
            name: round.name,
            bestOf: round.bestOf,
        });
    }

	await db.orm.public.Season
		.where({
			id: seasonId,
		})
		.update({
			playoffsEnabled: true,
		});

    const league = await db.orm.public.League.first({
        id: leagueId,
    });

    if (league) {
        revalidatePath(
            `/leagues/${league.slug}/settings`
        );
    }

    return {
        success: true,
    };
}

export async function disableSeasonPlayoffs(
    leagueId: number,
    seasonId: number
) {
    const session = await auth();

    if (!session?.user?.email) {
        return {
            success: false,
            error: "You must be signed in.",
        };
    }

    const user = await db.orm.public.User.first({
        email: session.user.email,
    });

    if (!user) {
        return {
            success: false,
            error: "User not found.",
        };
    }

    const season = await db.orm.public.Season.first({
        id: seasonId,
        leagueId,
    });

    if (!season) {
        return {
            success: false,
            error: "Season not found.",
        };
    }

    const memberships = await db.orm.public.LeagueUser
        .where({
            userId: user.id,
            leagueId,
        })
        .all();

    const membership = memberships[0];

    if (
        !membership ||
        !canManageLeague(membership.role)
    ) {
        return {
            success: false,
            error: "You do not have permission to configure playoffs.",
        };
    }

	const existingPlayoff =
		await db.orm.public.Playoff.first({
			seasonId,
		});

	if (existingPlayoff) {
		await db.orm.public.Playoff.delete({
			id: existingPlayoff.id,
		});
	}

	await db.orm.public.Season.update({
		id: seasonId,
		playoffsEnabled: false,
	});

    return {
        success: true,
    };
}


type CreateSeasonInput = {
    name: string;
    sourceSeasonId: number | null;
    carryOver: {
        teams: boolean;
        rosters: boolean;
        rules: boolean;
        playoffs: boolean;
    };
};

export async function createSeason(
    leagueId: number,
    input: CreateSeasonInput
) {
    const session = await auth();

    if (!session?.user?.email) {
        return {
            success: false,
            error: "You must be signed in.",
        };
    }

	const league = await db.orm.public.League.first({
		id: leagueId,
	});

	if (!league) {
		return {
			success: false,
			error: "League not found.",
		};
	}

    const trimmedName = input.name.trim();

    if (!trimmedName || trimmedName.length > 100) {
        return {
            success: false,
            error: "Enter a valid season name.",
        };
    }

    const generateSlug = (value: string) =>
        value
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");

    const slug = generateSlug(trimmedName);

    if (!slug) {
        return {
            success: false,
            error: "Season name must contain letters or numbers.",
        };
    }

    const user = await db.orm.public.User.first({
        email: session.user.email,
    });

    if (!user) {
        return {
            success: false,
            error: "User not found.",
        };
    }

    const membership = await db.orm.public.LeagueUser.first({
        userId: user.id,
        leagueId,
    });

    if (
        !membership ||
        !["owner", "admin"].includes(membership.role)
    ) {
        return {
            success: false,
            error: "You do not have permission to create seasons.",
        };
    }

    const existingSeason = await db.orm.public.Season.first({
        leagueId,
        slug,
    });

    if (existingSeason) {
        return {
            success: false,
            error: "A season with this name already exists.",
        };
    }

	const {
		sourceSeasonId,
		carryOver,
	} = input;

	if (carryOver.rosters && !carryOver.teams) {
		return {
			success: false,
			error: "You must carry over teams to carry over rosters.",
		};
	}

	const requiresSource = Object.values(carryOver).some(Boolean);

	if (requiresSource && sourceSeasonId === null) {
		return {
			success: false,
			error: "Select a season to copy settings from.",
		};
	}

	let sourceSeason = null;

	if (sourceSeasonId !== null) {
		if (!Number.isInteger(sourceSeasonId) || sourceSeasonId <= 0) {
			return {
				success: false,
				error: "Invalid source season.",
			};
		}

		sourceSeason = await db.orm.public.Season.first({
			id: sourceSeasonId,
			leagueId,
		});

		if (!sourceSeason) {
			return {
				success: false,
				error: "The selected source season does not belong to this league.",
			};
		}
	}

	try {
		const seasonId = await db.transaction(async (tx) => {
			const season = await tx.orm.public.Season.create({
				leagueId,
				name: trimmedName,
				slug,
				active: false,
				matchFormat: carryOver.rules && sourceSeason
					? sourceSeason.matchFormat
					: "Doubles",
				rules: carryOver.rules && sourceSeason
					? sourceSeason.rules
					: null,
			});

			if (carryOver.teams && sourceSeason) {
				const sourceTeams = await tx.orm.public.SeasonTeam
					.where({
						seasonId: sourceSeason.id,
					})
					.all();

				for (const sourceTeam of sourceTeams) {
					await tx.orm.public.SeasonTeam.create({
						seasonId: season.id,
						teamId: sourceTeam.teamId,
						playerStatsEnabled: sourceTeam.playerStatsEnabled,
					});
				}
			}

			if (carryOver.rosters && sourceSeason) {
				const sourceRosters = await tx.orm.public.RosterPlayer
					.where({
						seasonId: sourceSeason.id,
					})
					.all();

				for (const rosterPlayer of sourceRosters) {
					await tx.orm.public.RosterPlayer.create({
						seasonId: season.id,
						teamId: rosterPlayer.teamId,
						playerId: rosterPlayer.playerId,
						active: rosterPlayer.active,
						captainPosition: rosterPlayer.captainPosition,
					});
				}
			}

			if (carryOver.playoffs && sourceSeason) {
				const sourcePlayoff = await tx.orm.public.Playoff.first({
					seasonId: sourceSeason.id,
				});

				if (sourcePlayoff) {
					const newPlayoff = await tx.orm.public.Playoff.create({
						seasonId: season.id,
						teamCount: sourcePlayoff.teamCount,
						reseed: sourcePlayoff.reseed,
					});

					const sourceRounds = await tx.orm.public.PlayoffRoundConfig
						.where({
							playoffId: sourcePlayoff.id,
						})
						.all();

					for (const round of sourceRounds) {
						await tx.orm.public.PlayoffRoundConfig.create({
							playoffId: newPlayoff.id,
							round: round.round,
							name: round.name,
							bestOf: round.bestOf,
						});
					}
				}
			}

			return season.id;
		});

		revalidatePath(`/leagues/${league.slug}/settings`);

		return {
			success: true,
			seasonId,
		};
	} catch (error) {
		console.error("Failed to create season:", error);

		return {
			success: false,
			error: "Unable to create season.",
		};
	}
}

export async function activateSeason(
    leagueId: number,
    seasonId: number
) {
    const session = await auth();

    if (!session?.user?.email) {
        return {
            success: false,
            error: "You must be signed in.",
        };
    }

    const user = await db.orm.public.User.first({
        email: session.user.email,
    });

    if (!user) {
        return {
            success: false,
            error: "User not found.",
        };
    }

    const membership = await db.orm.public.LeagueUser.first({
        leagueId,
        userId: user.id,
    });

    if (
        !membership ||
        !["owner", "admin"].includes(membership.role)
    ) {
        return {
            success: false,
            error: "You do not have permission to activate seasons.",
        };
    }

    const season = await db.orm.public.Season.first({
        id: seasonId,
        leagueId,
    });

    if (!season) {
        return {
            success: false,
            error: "Season not found.",
        };
    }

    if (season.active) {
        return {
            success: true,
        };
    }

    try {
        await db.transaction(async (tx) => {
            const seasons = await tx.orm.public.Season
                .where({ leagueId })
                .all();

            for (const existingSeason of seasons) {
                await tx.orm.public.Season
                    .where({ id: existingSeason.id })
                    .update({
                        active: existingSeason.id === seasonId,
                    });
            }
        });

        const league = await db.orm.public.League.first({
            id: leagueId,
        });

        if (league) {
            revalidatePath(`/leagues/${league.slug}/settings`, "layout");
        }

        revalidatePath("/dashboard");

        return {
            success: true,
        };
    } catch (error) {
        console.error("Failed to activate season:", error);

        return {
            success: false,
            error: "Unable to activate season.",
        };
    }
}