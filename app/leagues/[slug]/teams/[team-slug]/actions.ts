"use server";

import { auth } from "@/auth";
import { db } from "@/src/prisma/db";
import { revalidatePath } from "next/cache";

export async function createRosterPlayer(
    leagueId: number,
    seasonId: number,
    teamId: number,
    firstName: string,
    lastName: string,
    email?: string,
    phone?: string
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

    const season = await db.orm.public.Season.first({
        id: seasonId,
        leagueId,
    });

    if (!season) {
        return {
            success: false,
            error: "Season does not belong to this league.",
        };
    }

    if (!season.active) {
        return {
            success: false,
            error: "Players cannot be added to historical seasons.",
        };
    }

    const seasonTeam = await db.orm.public.SeasonTeam.first({
        seasonId,
        teamId,
    });

    if (!seasonTeam) {
        return {
            success: false,
            error: "Team does not belong to this season.",
        };
    }

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedEmail = email?.trim() || null;
    const trimmedPhone = phone?.trim() || null;

    if (!trimmedFirstName || !trimmedLastName) {
        return {
            success: false,
            error: "First and last name are required.",
        };
    }

    if (trimmedEmail) {
        const existingPlayer = await db.orm.public.Player.first({
            leagueId,
            email: trimmedEmail,
        });

        if (existingPlayer) {
            return {
                success: false,
                error: "A player with this email already exists in this league. Use Add Existing Player instead.",
            };
        }
    }

    const player = await db.orm.public.Player.create({
        leagueId,
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        email: trimmedEmail,
        phone: trimmedPhone,
        active: true,
    });

    await db.orm.public.RosterPlayer.create({
        seasonId,
        teamId,
        playerId: player.id,
        active: true,
    });

    revalidatePath(`/leagues/${membership.league.slug}/teams`);

    return {
        success: true,
    };
}

export async function addExistingRosterPlayer(
    leagueId: number,
    seasonId: number,
    teamId: number,
    playerId: number
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

    const season = await db.orm.public.Season.first({
        id: seasonId,
        leagueId,
    });

    if (!season) {
        return {
            success: false,
            error: "Season does not belong to this league.",
        };
    }

    if (!season.active) {
        return {
            success: false,
            error: "Players cannot be added to historical seasons.",
        };
    }

    const seasonTeam = await db.orm.public.SeasonTeam.first({
        seasonId,
        teamId,
    });

    if (!seasonTeam) {
        return {
            success: false,
            error: "Team does not belong to this season.",
        };
    }

    const player = await db.orm.public.Player.first({
        id: playerId,
        leagueId,
        active: true,
    });

    if (!player) {
        return {
            success: false,
            error: "Player not found.",
        };
    }

    const existingRosterSpot = await db.orm.public.RosterPlayer.first({
        seasonId,
        playerId,
    });

    if (existingRosterSpot) {
        return {
            success: false,
            error: "This player is already on a roster for this season.",
        };
    }

    await db.orm.public.RosterPlayer.create({
        seasonId,
        teamId,
        playerId,
        active: true,
    });

    revalidatePath(`/leagues/${membership.league.slug}/teams`);

    return {
        success: true,
    };
}

export async function removeRosterPlayer(
    rosterPlayerId: number,
    leagueId: number,
    seasonId: number,
    teamId: number
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

    const rosterPlayer = await db.orm.public.RosterPlayer
        .where({
            id: rosterPlayerId,
            seasonId,
            teamId,
        })
        .include("season")
        .first();

    if (
        !rosterPlayer ||
        rosterPlayer.season.leagueId !== leagueId
    ) {
        return {
            success: false,
            error: "Roster player not found.",
        };
    }

    const lineup = await db.orm.public.MatchLineup
        .where({
            rosterPlayerId,
        })
        .first();

    if (lineup) {
        return {
            success: false,
            error: "This player has already appeared in a lineup and cannot change teams this season.",
        };
    }
    
    await db.orm.public.RosterPlayer
        .where({
            id: rosterPlayerId,
            seasonId,
            teamId,
        })
        .delete();
    
    revalidatePath(`/leagues/${membership.league.slug}/teams`);

    return {
        success: true,
    };
}

export async function updatePlayer(
    playerId: number,
    leagueId: number,
    firstName: string,
    lastName: string,
    email?: string,
    phone?: string
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

    const player = await db.orm.public.Player.first({
        id: playerId,
        leagueId,
    });

    if (!player) {
        return {
            success: false,
            error: "Player not found.",
        };
    }

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();

    if (!trimmedFirstName || !trimmedLastName) {
        return {
            success: false,
            error: "First and last name are required.",
        };
    }

    await db.orm.public.Player
        .where({
            id: playerId,
            leagueId,
        })
        .update({
            firstName: trimmedFirstName,
            lastName: trimmedLastName,
            email: email?.trim() || null,
            phone: phone?.trim() || null,
        });

    revalidatePath(`/leagues/${membership.league.slug}/teams`);

    return {
        success: true,
    };
}

export async function saveTeamCaptains(
    leagueId: number,
    seasonId: number,
    teamId: number,
    captainId: number | null,
    coCaptainId: number | null
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
            error: "You do not have permission to manage team captains.",
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

    if (!season.active) {
        return {
            success: false,
            error: "Captains cannot be changed for previous seasons.",
        };
    }

    const seasonTeam = await db.orm.public.SeasonTeam.first({
        seasonId,
        teamId,
    });

    if (!seasonTeam) {
        return {
            success: false,
            error: "Team does not belong to this season.",
        };
    }

    if (
        captainId !== null &&
        coCaptainId !== null &&
        captainId === coCaptainId
    ) {
        return {
            success: false,
            error: "Captain and co-captain must be different players.",
        };
    }

    const selectedIds = [captainId, coCaptainId].filter(
        (id): id is number => id !== null
    );

    for (const rosterPlayerId of selectedIds) {
        const rosterPlayer = await db.orm.public.RosterPlayer
            .where({
                id: rosterPlayerId,
                seasonId,
                teamId,
                active: true,
            })
            .include("player")
            .first();

        if (!rosterPlayer) {
            return {
                success: false,
                error: "Selected captain is not on this team's active roster.",
            };
        }

        if (
            !rosterPlayer.player.email?.trim() &&
            !rosterPlayer.player.phone?.trim()
        ) {
            return {
                success: false,
                error: "Captains must have an email address or phone number.",
            };
        }
    }

    // Get the team's current captains.
    const currentCaptains = await db.orm.public.RosterPlayer
        .where({
            seasonId,
            teamId,
        })
        .all();

    // Clear existing captain assignments.
    for (const player of currentCaptains) {
        if (player.captainPosition !== null) {
            await db.orm.public.RosterPlayer
                .where({ id: player.id })
                .update({
                    captainPosition: null,
                });
        }
    }

    // Assign the captain.
    if (captainId !== null) {
        await db.orm.public.RosterPlayer
            .where({
                id: captainId,
                seasonId,
                teamId,
            })
            .update({
                captainPosition: "primary",
            });
    }

    // Assign the co-captain.
    if (coCaptainId !== null) {
        await db.orm.public.RosterPlayer
            .where({
                id: coCaptainId,
                seasonId,
                teamId,
            })
            .update({
                captainPosition: "co_captain",
            });
    }

    revalidatePath(
        `/leagues/${membership.league.slug}/teams`
    );

    return {
        success: true,
    };
}

export async function findPlayerAccount(
    playerId: number,
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
        .first();

    if (
        !membership ||
        !["owner", "admin"].includes(membership.role)
    ) {
        return {
            success: false,
            error: "You do not have permission to manage player accounts.",
        };
    }

    const player = await db.orm.public.Player.first({
        id: playerId,
        leagueId,
    });

    if (!player) {
        return {
            success: false,
            error: "Player not found.",
        };
    }

    if (player.userId !== null) {
        return {
            success: false,
            error: "This player already has a linked account.",
        };
    }

    const email = player.email?.trim();

    if (!email) {
        return {
            success: false,
            error: "This player needs an email address to find an account.",
        };
    }

    const account = await db.orm.public.User.first({
        email,
    });

    if (!account) {
        return {
            success: false,
            error: "No Chalk & Table account was found with this email address.",
        };
    }

    const existingPlayer = await db.orm.public.Player.first({
        leagueId,
        userId: account.id,
    });

    if (existingPlayer) {
        return {
            success: false,
            error: "This account is already linked to another player.",
        };
    }

    return {
        success: true,
        account: {
            id: account.id,
            email: account.email,
        },
    };
}

export async function linkPlayerAccount(
    playerId: number,
    leagueId: number,
    accountId: number
) {
    const result = await findPlayerAccount(
        playerId,
        leagueId
    );

    if (!result.success || !result.account) {
        return {
            success: false,
            error: result.error ?? "Unable to link account.",
        };
    }

    if (result.account.id !== accountId) {
        return {
            success: false,
            error: "The selected account does not match the player.",
        };
    }

    await db.orm.public.Player
        .where({
            id: playerId,
            leagueId,
            userId: null,
        })
        .update({
            userId: accountId,
        });

    return {
        success: true,
    };
}