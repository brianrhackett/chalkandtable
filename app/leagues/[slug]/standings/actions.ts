"use server";

import { auth } from "@/auth";
import { db } from "@/src/prisma/db";
import { canManageLeague } from "@/src/lib/permissions/league";
import { themes, type ThemeKey } from "@/src/lib/themes";
import { revalidatePath } from "next/cache";
import { Temporal } from "@js-temporal/polyfill";


export async function startPlayoffs(
    leagueId: number,
    seasonId: number,
    orderedTeamIds: number[]
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
            error: "You do not have permission to start playoffs.",
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

    const playoff = await db.orm.public.Playoff.first({
        seasonId,
    });

    if (!playoff) {
        return {
            success: false,
            error: "Playoffs are not configured for this season.",
        };
    }

    const existingSeries = await db.orm.public.PlayoffSeries
        .where({
            seasonId,
        })
        .all();

    if (existingSeries.length > 0) {
        return {
            success: false,
            error: "Playoffs have already started.",
        };
    }

    // Check that all regular-season matches have been completed.
    const matches = await db.orm.public.Match
        .where({
            seasonId,
        })
        .all();

    const regularSeasonMatches = matches.filter(
        (match) => match.week !== null
    );

    if (
        regularSeasonMatches.length === 0 ||
        regularSeasonMatches.some(
            (match) => match.status !== "completed"
        )
    ) {
        return {
            success: false,
            error: "The regular season is not complete.",
        };
    }

    // Get every team participating in this season.
    const seasonTeams = await db.orm.public.SeasonTeam
        .where({
            seasonId,
        })
        .all();

    const validTeamIds = seasonTeams.map(
        (seasonTeam) => seasonTeam.teamId
    );

    // Ensure every team appears exactly once.
    if (
        orderedTeamIds.length !== validTeamIds.length ||
        new Set(orderedTeamIds).size !== orderedTeamIds.length ||
        orderedTeamIds.some(
            (teamId) => !validTeamIds.includes(teamId)
        )
    ) {
        return {
            success: false,
            error: "Invalid playoff seeding.",
        };
    }

    if (playoff.teamCount > orderedTeamIds.length) {
        return {
            success: false,
            error: "Not enough teams to start playoffs.",
        };
    }

    // Determine the opening playoff round.
    const openingRound = Math.log2(playoff.teamCount);

    const roundNames: Record<number, "Final" | "Semifinal" | "Quarterfinal"> = {
        1: "Final",
        2: "Semifinal",
        3: "Quarterfinal",
    };

    const round = roundNames[openingRound];

    if (!round) {
        return {
            success: false,
            error: "Unsupported playoff team count.",
        };
    }

    // Retrieve the opening-round configuration.
    const roundConfig = await db.orm.public.PlayoffRoundConfig
        .where({
            playoffId: playoff.id,
            round: 1,
        })
        .first();

    if (!roundConfig) {
        return {
            success: false,
            error: "Opening-round playoff configuration not found.",
        };
    }

    try {
        await db.transaction(async (tx) => {
            // Lock the season so two admins cannot start playoffs simultaneously.
            const lockedSeason = await tx.orm.public.Season
                .where({
                    id: seasonId,
                    leagueId,
                })
                .first();

            if (!lockedSeason) {
                throw new Error("Season not found.");
            }


            // Verify the regular season is complete.
            const matches = await tx.orm.public.Match
                .where({
                    seasonId,
                })
                .all();

            const regularSeasonMatches = matches.filter(
                (match) => match.week !== null
            );

            if (
                regularSeasonMatches.length === 0 ||
                regularSeasonMatches.some(
                    (match) => match.status !== "completed"
                )
            ) {
                throw new Error("The regular season is not complete.");
            }

            // Recheck inside the transaction.
            const existingSeries = await tx.orm.public.PlayoffSeries
                .where({
                    seasonId,
                })
                .all();

            if (existingSeries.length > 0) {
                throw new Error("Playoffs have already started.");
            }

            // Save the official final rankings.
            for (const [index, teamId] of orderedTeamIds.entries()) {
                await tx.orm.public.SeasonTeam
                    .where({
                        seasonId,
                        teamId,
                    })
                    .update({
                        finalRank: index + 1,
                    });
            }

            // Create the opening-round playoff series.
            for (
                let index = 0;
                index < playoff.teamCount / 2;
                index++
            ) {
                const higherSeed = index + 1;
                const lowerSeed = playoff.teamCount - index;

                await tx.orm.public.PlayoffSeries.create({
                    seasonId,
                    playoffId: playoff.id,
                    round,
                    seriesNumber: index + 1,
                    higherSeedTeamId: orderedTeamIds[higherSeed - 1],
                    higherSeed,
                    lowerSeedTeamId: orderedTeamIds[lowerSeed - 1],
                    lowerSeed,
                    bestOf: roundConfig.bestOf,
                });
            }
        });
    } catch (error) {
        console.error("Failed to start playoffs:", error);

        return {
            success: false,
            error: error instanceof Error
                ? error.message
                : "Unable to start playoffs.",
        };
    }

    revalidatePath(`/leagues/${membership.league.slug}/standings`);

    return {
        success: true,
    };
}


export type PlayoffScheduleGameInput = {
    id: number | null;
    seriesMatch: number;
    scheduledAt: string;
    homeTeamId: number;
};

export async function savePlayoffSchedule(
    leagueId: number,
    seriesId: number,
    games: PlayoffScheduleGameInput[]
) {
    const session = await auth();

    if (!session?.user?.email) {
        return { success: false, error: "Unauthorized." };
    }

    const user = await db.orm.public.User.first({
        email: session.user.email,
    });

    if (!user) {
        return { success: false, error: "User not found." };
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
            error: "You do not have permission to schedule matches.",
        };
    }

    const series = await db.orm.public.PlayoffSeries
        .where({ id: seriesId })
        .include("season")
        .first();

    if (!series || series.season.leagueId !== leagueId) {
        return { success: false, error: "Series not found." };
    }

    if (games.length !== series.bestOf) {
        return { success: false, error: "Invalid number of games." };
    }

    const existingMatches = await db.orm.public.Match
        .where({ playoffSeriesId: seriesId })
        .all();

    const validTeams = [
        series.higherSeedTeamId,
        series.lowerSeedTeamId,
    ];

    const gameNumbers = new Set<number>();

    for (const game of games) {
        if (
            !Number.isInteger(game.seriesMatch) ||
            game.seriesMatch < 1 ||
            game.seriesMatch > series.bestOf ||
            gameNumbers.has(game.seriesMatch)
        ) {
            return { success: false, error: "Invalid game number." };
        }

        gameNumbers.add(game.seriesMatch);

        if (!validTeams.includes(game.homeTeamId)) {
            return { success: false, error: "Invalid home team." };
        }

        if (Number.isNaN(new Date(game.scheduledAt).getTime())) {
            return { success: false, error: "Invalid date or time." };
        }

        const existing = existingMatches.find(
            (match) => match.seriesMatch === game.seriesMatch
        );

        if (
            existing &&
            ["completed", "cancelled"].includes(existing.status)
        ) {
            continue;
        }

        if (game.id !== (existing?.id ?? null)) {
            return { success: false, error: "Schedule is out of date." };
        }
    }

    try {
        await db.transaction(async (tx) => {
            for (const game of games) {
                const existing = existingMatches.find(
                    (match) => match.seriesMatch === game.seriesMatch
                );

                if (
                    existing &&
                    ["completed", "cancelled"].includes(existing.status)
                ) {
                    continue;
                }

                const awayTeamId =
                    game.homeTeamId === series.higherSeedTeamId
                        ? series.lowerSeedTeamId
                        : series.higherSeedTeamId;

                const scheduledAt = Temporal.Instant.from(game.scheduledAt);

                if (existing) {
                    await tx.orm.public.Match
                        .where({ id: existing.id })
                        .update({
                            scheduledAt,
                            homeTeamId: game.homeTeamId,
                            awayTeamId,
                        });
                } else {
                    await tx.orm.public.Match.create({
                        seasonId: series.seasonId,
                        week: null,
                        playoffSeriesId: series.id,
                        seriesMatch: game.seriesMatch,
                        homeTeamId: game.homeTeamId,
                        awayTeamId,
                        scheduledAt,
                        status: "scheduled",
                    });
                }
            }
        });
    } catch (error) {
        console.error("Failed to save playoff schedule:", error);

        return {
            success: false,
            error: "Unable to save playoff schedule.",
        };
    }

    revalidatePath(`/leagues/${membership.league.slug}/standings`);

    return { success: true };
}