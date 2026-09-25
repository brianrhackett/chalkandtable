import { notFound } from "next/navigation";

import { getLeagueTeams } from "@/src/lib/leagues/getLeagueTeams";
import TeamCard from "@/app/components/TeamCard";
import SeasonSelect from "@/app/components/SeasonSelect";

type TeamsPageProps = {
	params: Promise<{
		slug: string;
	}>;
	searchParams: Promise<{
        season?: string;
    }>;
};

export default async function TeamsPage({
    params,
	searchParams
}: TeamsPageProps) {
	const { slug } = await params;
	const { season: seasonSlug } = await searchParams;

	const data = await getLeagueTeams(slug, seasonSlug);

	if (!data) {
		notFound();
	}

	const {
		league,
		season,
		seasons,
		teams,
	} = data;

	if (!season) {
		return (
			<main className="mx-auto w-full max-w-7xl px-6 py-12">
				<h1 className="mt-2 font-[family-name:var(--font-serif)] text-[var(--accent)] text-xl font-semibold sm:text-2xl">
					League Teams
				</h1>

				<p className="mt-3 text-[var(--text-muted)]">
					There is no active season.
				</p>
			</main>
		);
	}

	return (
		<main className="mx-auto w-full max-w-7xl px-6 py-12">
			<div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<h1 className="mt-2 font-[family-name:var(--font-serif)] text-[var(--accent)] text-xl font-semibold sm:text-2xl">
						League Teams
					</h1>

					<p className="mt-3 text-[var(--text-muted)]">
						{teams.length} teams competing in the{" "}
						{season.name} season.
					</p>
				</div>
				<div>
					<SeasonSelect 
						seasons={seasons}
					    selectedSeason={season}
					/>
				</div>
			</div>

			<div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
				{teams.map((team) => (
                    <TeamCard
                        key={team.id}
                        team={team}
                        leagueSlug={league.slug}
						seasonSlug={seasonSlug}
                    />
				))}
			</div>
		</main>
	);
}