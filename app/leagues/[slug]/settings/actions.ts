"use server";

import { auth } from "@/auth";
import { db } from "@/src/prisma/db";
import { canManageLeague } from "@/src/lib/permissions/league";
import { themes, type ThemeKey } from "@/src/lib/themes";
import { revalidatePath } from "next/cache";

export type LeagueSettingsState = {
	error: string | null;
	success: boolean;
};

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