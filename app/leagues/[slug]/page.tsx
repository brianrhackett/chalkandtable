import { notFound } from "next/navigation";
import { db } from "@/src/prisma/db";
import LeagueHome from "@/app/components/LeagueHome";
type LeaguePageProps = {
	params: Promise<{
		slug: string;
	}>;
};

export default async function LeaguePage({
	params,
}: LeaguePageProps) {
	const { slug } = await params;

	const league = await db.orm.public.League.first({
		slug,
	});

	if (!league) {
		notFound();
	}

	const season = await db.orm.public.Season.first({
		leagueId: league.id,
		active: true,
	});

	if (!season) {
		return (
			<main className="mx-auto w-full max-w-7xl px-6 py-10">
				<h1 className="font-[family-name:var(--font-serif)] text-4xl">
					No Active Season
				</h1>

				<p className="mt-3 text-[var(--text-muted)]">
					This league does not currently have an active season.
				</p>
			</main>
		);
	}

	return (
		<LeagueHome
            league={league}
            season={season}
        />
	);
}