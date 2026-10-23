import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/src/prisma/db";
import Link from 'next/link'
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

export default async function DashboardPage() {
	const session = await auth();

	if (!session?.user) {
		redirect("/login");
	}

    const user = await db.orm.public.User.first({
		email: session.user.email,
	});

	if (!user) {
		redirect("/login");
	}

    const memberships = await db.orm.public.LeagueUser
        .where({
    		userId: user.id,
	    })
        .include("league", (league) =>
	    	league.include("seasons", (season) =>
                season
                    .include("seasonTeams")
                    .include("matches", (match) =>
                        match
                            .include("homeTeam", (team) =>
                                team.include("venue")
                            )
                            .include("awayTeam")
                    )
            )
    	)
        .all();

    const players = await db.orm.public.Player
        .where({
            userId: user.id,
        })
        .include("league", (league) =>
            league.include("seasons", (season) =>
                season
                    .include("seasonTeams")
                    .include("matches", (match) =>
                        match
                            .include("homeTeam", (team) =>
                                team.include("venue")
                            )
                            .include("awayTeam")
                    )
            )
        )
        .all();

    const captainAssignments = (
        await Promise.all(
            players.map((player) =>
                db.orm.public.RosterPlayer
                    .where({
                        playerId: player.id,
                        active: true,
                    })
                    .all()
            )
        )
    ).flat();

    const leagues = [
        ...memberships.map((membership) => membership.league),
        ...players.map((player) => player.league),
    ].filter(
        (league, index, all) =>
            all.findIndex((item) => item.id === league.id) === index
    );

	return (
        <>
            <Header />
            <main className="p-8 w-7xl max-w-full m-auto">
                <section className="flex items-start justify-between gap-8 flex-col sm:flex-row">
                    <div>
                        <h1 className="font-[family-name:var(--font-display)] text-5xl uppercase">
                            Welcome back, {session.user.name}.
                        </h1>
                        <p className="mt-3 text-[var(--text-muted)]">
                            Your leagues, teams, and upcoming matches.
                        </p>
                    </div>
                
                    <Link
                        href="create-league"
                        className="btn-primary"
                    >
                        + Create New League
                    </Link>
                
                </section>
                <div className="mt-10">
                    <div className="mb-5 flex items-end justify-between">
                        <div>
                            <h2 className="font-[family-name:var(--font-display)] text-3xl uppercase">
                                Your Leagues
                            </h2>

                            <p className="mt-1 text-sm text-[var(--text-muted)]">
                                Leagues you manage or participate in.
                            </p>
                        </div>

                        <span className="text-sm text-[var(--text-muted)]">
                            {leagues.length} {leagues.length === 1 ? "league" : "leagues"}
                        </span>
                    </div>

                    
                    <div className="grid gap-5">
                        {leagues.map((league) => {
                            const activeSeason = league.seasons.find(
                                (season) => season.active
                            );

                            const player = players.find(
                                (player) => player.leagueId === league.id
                            );

                            const isCaptain = Boolean(
                                player &&
                                activeSeason &&
                                captainAssignments.some(
                                    (rosterPlayer) =>
                                        rosterPlayer.playerId === player.id &&
                                        rosterPlayer.seasonId === activeSeason.id &&
                                        (
                                            rosterPlayer.captainPosition === "primary" ||
                                            rosterPlayer.captainPosition === "co_captain"
                                        )
                                )
                            );

                            const membership = memberships.find(
                                (membership) => membership.leagueId === league.id
                            );

                            const isOwnerOrAdmin =
                                membership?.role === "owner" ||
                                membership?.role === "admin";

                            const captainTeamIds = player && activeSeason
                                ? captainAssignments
                                    .filter(
                                        (rosterPlayer) =>
                                            rosterPlayer.playerId === player.id &&
                                            rosterPlayer.seasonId === activeSeason.id &&
                                            rosterPlayer.active &&
                                            (
                                                rosterPlayer.captainPosition === "primary" ||
                                                rosterPlayer.captainPosition === "co_captain"
                                            )
                                    )
                                    .map((rosterPlayer) => rosterPlayer.teamId)
                                : [];

                            const visibleMatches = activeSeason?.matches.filter((match) =>
                                isOwnerOrAdmin ||
                                captainTeamIds.includes(match.homeTeamId) ||
                                captainTeamIds.includes(match.awayTeamId)
                            ) ?? [];

                            const upcomingMatches = visibleMatches
                                .filter((match) => match.status === "scheduled")
                                .sort((a, b) =>
                                    Temporal.Instant.compare(
                                        a.scheduledAt,
                                        b.scheduledAt
                                    )
                                )
                                .slice(0, 5);

                            const completedMatches = visibleMatches
                                .filter((match) => match.status === "completed")
                                .sort((a, b) =>
                                    Temporal.Instant.compare(
                                        b.scheduledAt,
                                        a.scheduledAt
                                    )
                                )
                                .slice(0, 5);

                            return (
                                <div 
                                    key={league.id} 
                                    className="grid gap-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                                >
                                    <div
                                        className="rounded-lg border border-[var(--surface-alt)] bg-[var(--surface)] p-6 md:col-span-2 xl:col-span-1"
                                    >
                                        <div className="flex items-end justify-between gap-6">
                                            <div className="w-full">
                                                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
                                                    {memberships.find(
                                                        (membership) => membership.leagueId === league.id
                                                    )?.role ?? (isCaptain ? "Captain" : "Player")}
                                                </p>

                                                <h3 className="font-[family-name:var(--font-serif)] text-2xl">
                                                    {league.name}
                                                </h3>

                                                {activeSeason && (
                                                    <>
                                                    <div className="mt-5">
                                                        <p className="text-xs uppercase tracking-wider text-[var(--text-muted)]">
                                                            Active Season
                                                        </p>

                                                        <p className="mt-1 font-[family-name:var(--font-mono)] text-lg">
                                                            {activeSeason.name}
                                                        </p>
                                                    </div>
                                            
                                                    <div className="mt-2 flex justify-between items-start gap-6">
                                                        <p className="mt-1 font-[family-name:var(--font-mono)] text-lg">
                                                            {activeSeason.seasonTeams.length} teams
                                                        </p>
                                                        <p className="mt-1 font-[family-name:var(--font-mono)] text-lg">
                                                            {activeSeason.matches.length} matches
                                                        </p>
                                                    </div>
                                                    </>
                                                )}
                                            </div>

                                            
                                        </div>
                                        <div className="mt-4 w-full">
                                            <Link
                                                href={`/leagues/${league.slug}`}
                                                className="btn-primary block text-center"
                                            >
                                                View League &rarr;
                                            </Link>
                                        </div>
                                    </div>

                                    <div className="rounded-lg border border-[var(--surface-alt)] p-6">
                                        <h3 className="font-[family-name:var(--font-display)] text-xl uppercase text-[var(--accent)]">
                                            Upcoming
                                        </h3>
                                        <div className="divide-y divide-[var(--surface-alt)]">
                                            {upcomingMatches.length > 0 ? (
                                                upcomingMatches.map((match) => {
                                                    return (
                                                        <Link 
                                                            key={match.id}
                                                            className="grid grid-cols-3 gap-4 py-4"
                                                            href={`/leagues/${league.slug}/matches/${match.id}`}
                                                        >
                                                            <div>{match.awayTeam.name}</div>
                                                            <div
                                                                className="text-center"
                                                            >
                                                                @
                                                            </div>
                                                            <div
                                                                className="text-right"
                                                            >
                                                                {match.homeTeam.name}
                                                            </div>
                                                            <div 
                                                                className="col-span-3 text-center font-semibold font-[family-name:var(--font-serif)] text-sm"
                                                            >
                                                                {match.homeTeam.venue?.name ?? "TBD"}
                                                                <p className="text-[var(--text-muted)] text-xs font-[family-name:var(--font-sans)]">
                                                                    {new Date(String(match.scheduledAt)).toLocaleDateString("en-US", {
                                                                        weekday: "short",
                                                                        month: "short",
                                                                        day: "numeric",
                                                                        timeZone: "UTC",
                                                                    })}
                                                                </p>
                                                            </div>
                                                        </Link>
                                                    )
                                                })
                                            
                                            ) : (
                                                <p className="text-[var(--text-muted)]">
                                                    No upcoming matches scheduled
                                                </p>
                                            )}
                                        </div>

                                    </div>
                                    <div className="rounded-lg border border-[var(--surface-alt)] p-6">
                                        <h3 className="font-[family-name:var(--font-display)] text-xl uppercase text-[var(--accent)]">
                                            Recent Results
                                        </h3>
                                        <div className="divide-y divide-[var(--surface-alt)]">
                                            {completedMatches.length > 0 ? (

                                                completedMatches.map((match) => {
                                                    return (
                                                        <div key={match.id}
                                                            className="grid grid-cols-3 gap-4 py-4"
                                                        >
                                                            <div>{match.awayTeam.name}</div>
                                                            <div 
                                                                className="font-[family-name:var(--font-mono)] text-center"
                                                            >
                                                                {match.awayScore} - {match.homeScore}
                                                            </div>
                                                            <div
                                                                className="text-right"
                                                            >
                                                                {match.homeTeam.name}
                                                            </div>
                                                            <div 
                                                                className="col-span-3 text-center font-semibold font-[family-name:var(--font-serif)] text-sm"
                                                            >
                                                                {match.homeTeam.venue?.name ?? "TBD"}
                                                                <p className="text-[var(--text-muted)] text-xs font-[family-name:var(--font-sans)]">
                                                                    {new Date(String(match.scheduledAt)).toLocaleDateString("en-US", {
                                                                        weekday: "short",
                                                                        month: "short",
                                                                        day: "numeric",
                                                                        timeZone: "UTC",
                                                                    })}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )
                                                })

                                            ) : (
                                                <p className="text-[var(--text-muted)]">
                                                    No recent results
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    
                    </div>
                </div>
            </main>
            <Footer />
        </>
	);
}