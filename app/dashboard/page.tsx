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
                        .include("matches")
            )
    	)
        .all();

	return (
        <>
            <Header />
            <main className="p-8 w-7xl max-w-full m-auto">
                <section className="flex items-start justify-between gap-8">
                    <div>
                        <h1 className="font-[family-name:var(--font-display)] text-5xl uppercase">
                            Welcome back, {session.user.name}.
                        </h1>
                        <p className="mt-3 text-[var(--text-muted)]">
                            Here are the leagues you manage
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
                            {memberships.length} {memberships.length === 1 ? "league" : "leagues"}
                        </span>
                    </div>

                    
                    <div className="grid gap-5">
                        {memberships.map((membership) => {
                            const league = membership.league;
                            const activeSeason = league.seasons.find(
                                (season) => season.active
                            );

                            const upcomingMatches = activeSeason?.matches
                                .filter((match) => match.status === "scheduled")
                                .sort(
                                    (a, b) =>
                                        new Date(a.scheduledAt).getTime() -
                                        new Date(b.scheduledAt).getTime()
                                )
                                .slice(0, 5) ?? [];

                            const completedMatches = activeSeason?.matches
                                .filter((match) => match.status === "completed")
                                .sort(
                                    (a, b) =>
                                        new Date(b.scheduledAt).getTime() -
                                        new Date(a.scheduledAt).getTime()
                                )
                                .slice(0, 5) ?? [];
                            return (
                                <div className="grid gap-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                                    <div
                                        key={league.id}
                                        className="rounded-lg border border-[var(--surface-alt)] bg-[var(--surface)] p-6 md:col-span-2 xl:col-span-1"
                                    >
                                        <div className="flex items-end justify-between gap-6">
                                            <div className="w-full">
                                                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
                                                    {membership.role}
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
                                                Manage League &rarr;
                                            </Link>
                                        </div>
                                    </div>

                                    <div className="rounded-lg border border-[var(--surface-alt)] p-6">
                                        <h3 className="font-[family-name:var(--font-display)] text-xl uppercase">
                                            Upcoming
                                        </h3>

                                        {upcomingMatches.length > 0 ? (
                                            
                                            upcomingMatches.map((match) => {
                                                return (
                                                    <div 
                                                        key={match.id}
                                                        className="grid grid-cols-3 gap-4"    
                                                    >
                                                        <div>{match.homeTeam}</div>
                                                        <div>{match.awayTeam}</div>
                                                        <div>{match.venue}</div>
                                                    </div>
                                                )
                                            })
                                        
                                        ) : (
                                            <p className="text-[var(--text-muted)]">
                                                No upcoming matches scheduled
                                            </p>
                                        )}


                                    </div>
                                    <div className="rounded-lg border border-[var(--surface-alt)] p-6">
                                        <h3 className="font-[family-name:var(--font-display)] text-xl uppercase">
                                            Recent Results
                                        </h3>
                                        {completedMatches.length > 0 ? (

                                            completedMatches.map((match) => {
                                                return (
                                                    <div key={match.id}
                                                        className="grid grid-cols-3 gap-4"
                                                    >
                                                        <div>{match.homeTeam}</div>
                                                        <div className="font-[family-name:var(--font-mono)]">{match.homeScore} - {match.awayScore}</div>
                                                        <div>{match.awayTeam}</div>
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
                            );
                        })}
                    
                    </div>
                </div>
            </main>
            <Footer />
        </>
	);
}