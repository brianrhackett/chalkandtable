import { auth } from "@/auth";
import { db } from "@/src/prisma/db";
import { canManageLeague } from "@/src/lib/permissions/league";
import type { ThemeKey } from "@/src/lib/themes";

import LeagueSettingsForm from "@/app/components/LeagueSettingsForm";

import { notFound, redirect } from "next/navigation";

type SettingsPageProps = {
	params: Promise<{
		slug: string;
	}>;
};

export default async function SettingsPage({
	params,
}: SettingsPageProps) {
    const session = await auth();

    if (!session?.user?.email) {
		redirect("/login");
	}

    const { slug } = await params;

    const user = await db.orm.public.User.first({
		email: session.user.email,
	});

	if (!user) {
		redirect("/login");
	}

    const membership = await db.orm.public.LeagueUser
		.where({
			userId: user.id,
		})
		.include("league")
		.first();

	if (!membership || membership.league.slug !== slug || !canManageLeague(membership.role)) {
		notFound();
	}

    const league = membership.league;

    return (
        <>
            
            <main className="mx-auto w-full max-w-7xl px-6 py-10">
                <h1 className="font-bold text-[var(--accent)] font-[family-name:var(--font-serif)] text-2xl">
                    League Settings
                </h1>

                <p className="mt-4 text-[var(--text-muted)]">
                    Manage your league&apos;s information, appearance, and features.
                </p>

                <LeagueSettingsForm
                    league={{
                        id: league.id,
                        name: league.name,
                        slug: league.slug,
                        theme: league.theme as ThemeKey,
                        playerStatsEnabled: league.playerStatsEnabled,
                    }}
                />
                
            </main>
        
        </>
	);
}