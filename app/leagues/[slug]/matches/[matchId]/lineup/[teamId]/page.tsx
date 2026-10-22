import { getMatchLineup } from "@/src/lib/leagues/matches/getMatchLineup";
import LineupEditor from "@/app/components/LineupEditor";
import Link from "next/link";

import { getLeaguePermissions } from "@/src/lib/leagues/getLeaguePermissions";
import { notFound } from "next/navigation";

type LineupPageProps = {
    params: Promise<{
        slug: string;
        matchId: string;
        teamId: string;
    }>;
};

export default async function LineupPage({
    params,
}: LineupPageProps) {
    const { slug, matchId, teamId } = await params;

    const data = await getMatchLineup({
        leagueSlug: slug,
        matchId: Number(matchId),
        teamId: Number(teamId),
    });

    if (!data) {
        notFound();
    }

    const {
        league,
        match,
        team,
        homeTeam,
        awayTeam,
        roster,
        lineup,
    } = data;

    const permissions = await getLeaguePermissions(
        league.id,
        match.seasonId
    );

    const canEditLineup =
        permissions.canManageLineup(team.id) &&
        match.status !== "completed";

    return (
        <div className="mx-auto max-w-7xl px-6 py-8">
            
            <div className="mb-6 font-sans text-sm text-[var(--text-muted)]">
                Schedule
                <span className="mx-2">/</span>
                Week {match.week}
                <span className="mx-2">/</span>
                {team.name} Lineup
            </div>

            <div className="mb-6">
                <Link
                    href={`/leagues/${league.slug}/schedule`}
                    className="font-sans text-sm font-semibold text-[var(--accent)] hover:underline"
                >
                    &larr; Back to Schedule
                </Link>
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                {/* Main content */}
                <div className="overflow-hidden rounded-xl border border-[var(--surface-alt)] bg-[var(--surface)]">
                    {/* Match header */}
                    <div className="border-b border-[var(--surface-alt)] p-6">
                        <p className="mb-2 font-sans text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
                            Week {match.week}
                        </p>

                        <h1 className="font-[family-name:var(--font-serif)] text-3xl font-bold">
                            {awayTeam.name}
                            <span className="mx-4 font-sans text-xl font-normal text-[var(--text-muted)]">
                                @
                            </span>
                            {homeTeam.name}
                        </h1>

                        <p className="mt-2 font-sans text-sm text-[var(--text-muted)]">
                            {new Intl.DateTimeFormat("en-US", {
                                weekday: "long",
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                                timeZone: "UTC",
                            }).format(new Date(String(match.scheduledAt)))}
                        </p>
                    </div>

                    {/* Lineup */}
                    
                    <LineupEditor
                        league={{
                            ...league,
                            createdAt: String(league.createdAt),
                            updatedAt: String(league.updatedAt),
                        }}
                        team={{
                            ...team,
                            createdAt: String(team.createdAt),
                            updatedAt: String(team.updatedAt),
                        }}
                        match={{
                            ...match,
                            scheduledAt: String(match.scheduledAt),
                            createdAt: String(match.createdAt),
                            updatedAt: String(match.updatedAt),
                        }}
                        roster={roster}
                        existingLineup={lineup}
                        canEditLineup={canEditLineup}
                    />

                </div>

                {/* Sidebar */}
                <aside className="space-y-6">
                    <div className="rounded-xl border border-[var(--surface-alt)] bg-[var(--surface)] p-6">
                        <h2 className="font-[family-name:var(--font-serif)] text-xl font-bold">
                            Available Players
                        </h2>

                        <p className="mt-2 font-sans text-sm leading-6 text-[var(--text-muted)]">
                            Active roster players for {team.name}.
                        </p>

                        <div className="mt-4 divide-y divide-[var(--surface-alt)]">
                            {roster.map((rosterPlayer) => (
                                <div
                                    key={rosterPlayer.playerId}
                                    className="py-3 font-sans text-sm"
                                >
                                    {rosterPlayer.name}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-xl border border-[var(--surface-alt)] bg-[var(--surface)] p-6">
                        <h2 className="font-[family-name:var(--font-serif)] text-xl font-bold">
                            Match Details
                        </h2>

                        <dl className="mt-4 divide-y divide-[var(--surface-alt)] font-sans text-sm">
                            <div className="flex justify-between gap-4 py-3">
                                <dt className="text-[var(--text-muted)]">Week</dt>
                                <dd className="font-medium">{match.week}</dd>
                            </div>

                            <div className="flex justify-between gap-4 py-3">
                                <dt className="text-[var(--text-muted)]">
                                    Home Team
                                </dt>
                                <dd className="font-medium">{homeTeam.name}</dd>
                            </div>

                            <div className="flex justify-between gap-4 py-3">
                                <dt className="text-[var(--text-muted)]">
                                    Away Team
                                </dt>
                                <dd className="font-medium">{awayTeam.name}</dd>
                            </div>
                        </dl>
                    </div>
                </aside>
            </div>
        </div>
    );
}