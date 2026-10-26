"use server";

import { auth } from "@/auth";
import { db } from "@/src/prisma/db";

export async function createLeague(
    name: string,
    seasonName: string
) {
    const session = await auth();

    if (!session?.user?.email) {
        return {
            success: false,
            error: "You must be signed in.",
        };
    }

    const trimmedName = name.trim();
    const trimmedSeasonName = seasonName.trim();

    if (!trimmedName || trimmedName.length > 100) {
        return {
            success: false,
            error: "Enter a valid league name.",
        };
    }

    if (!trimmedSeasonName || trimmedSeasonName.length > 100) {
        return {
            success: false,
            error: "Enter a valid season name.",
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

    const generateSlug = (value: string) =>
        value
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");

    const baseSlug = generateSlug(trimmedName);
    const seasonSlug = generateSlug(trimmedSeasonName);

    if (!baseSlug) {
        return {
            success: false,
            error: "League name must contain letters or numbers.",
        };
    }

    if (!seasonSlug) {
        return {
            success: false,
            error: "Season name must contain letters or numbers.",
        };
    }

    let slug = baseSlug;
    let suffix = 2;

    while (await db.orm.public.League.first({ slug })) {
        slug = `${baseSlug}-${suffix}`;
        suffix++;
    }

    const league = await db.orm.public.League.create({
        name: trimmedName,
        slug,
    });

    await db.orm.public.LeagueUser.create({
        leagueId: league.id,
        userId: user.id,
        role: "owner",
    });

    await db.orm.public.Season.create({
        leagueId: league.id,
        name: trimmedSeasonName,
        slug: seasonSlug,
        active: true,
        matchFormat: "Doubles",
    });

    return {
        success: true,
        slug: league.slug,
    };
}