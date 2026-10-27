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

    const league = await db.orm.public.League
        .include("seasons", (season) =>
                season.include("seasonTeams", (seasonTeam) =>
                    seasonTeam.include("team")
                )
                .include("matches")
            )
        .include("venues")
        .where({
            slug,
        })
        .first();

    if (!league) {
        notFound();
    }

    const membership = await db.orm.public.LeagueUser
		.where({
			userId: user.id,
            leagueId: league.id
		})
		.first();

    if (!membership || !canManageLeague(membership.role)) {
		notFound();
	}

    const seasons = await db.orm.public.Season
        .where({
            leagueId: league.id,
        })
        .all();

    const activeSeason = league.seasons.find(
        (season) => season.active
    );

    const venues = league.venues.map((venue) => ({
        id: venue.id,
        name: venue.name,
        teamCount: activeSeason.seasonTeams.filter(
            (seasonTeam) => seasonTeam.team.venueId === venue.id
        ).length,
    }));

    const playoff = await db.orm.public.Playoff.first({
        seasonId: activeSeason.id,
    });

    const playoffRounds = playoff
        ? await db.orm.public.PlayoffRoundConfig
            .where({
                playoffId: playoff.id,
            })
            .all()
        : [];

    const playoffConfig = playoff
                            ? {
                                id: playoff.id,
                                teamCount: playoff.teamCount,
                                reseed: playoff.reseed,
                                rounds: playoffRounds
                                            .sort((a, b) => a.round - b.round)
                                            .map((round) => ({
                                                round: round.round,
                                                name: round.name,
                                                bestOf: round.bestOf,
                                            })),
                            }
                            : null;

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
                        venues: venues
                    }}
                    season={{
                        id: activeSeason.id,
                        name: activeSeason.name,
                        rules: activeSeason.rules,
                        hasSchedule: activeSeason.matches.length > 0,
                        teams: activeSeason.seasonTeams.map((seasonTeam) => seasonTeam.team),
                        playoff: playoffConfig,
                        playoffsEnabled: activeSeason.playoffsEnabled,
                    }}
                    seasons={seasons}
                />
                
            </main>
        
        </>
	);
}