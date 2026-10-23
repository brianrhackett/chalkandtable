import { notFound } from "next/navigation";

import { db } from "@/src/prisma/db";

import { getLeagueRules } from "@/src/lib/leagues/getLeagueRules";

import SeasonSelect from "@/app/components/SeasonSelect";

type RulesPageProps = {
	params: Promise<{
		slug: string;
	}>;
	searchParams: Promise<{
        season?: string;
    }>;
};

export default async function RulesPage({
	params,
	searchParams
}: RulesPageProps) {
    const { slug } = await params;
	const { season: seasonSlug } = await searchParams;

	const data = await getLeagueRules(slug, seasonSlug);

    if (!data) {
        notFound();
    }

    const { season, seasons } = data;

	return (
		<main className="mx-auto w-full max-w-7xl px-6 py-12">
			<div className="flex justify-between py-8 first:pt-0 flex-col gap-6 sm:flex-row sm:items-center">
				<div>
					<div className="">
						<h1 className="mt-2 font-[family-name:var(--font-serif)] text-[var(--accent)] text-xl font-semibold sm:text-2xl">
							League Rules
						</h1>

						<p className="mt-3 text-[var(--text-muted)]">
							{season.name} season
						</p>
					</div>
				</div>
				<div>
					<SeasonSelect 
						seasons={seasons}
					    selectedSeason={season}
					/>
				</div>
			</div>

			<section className="rounded-md p-6 border border-[var(--surface-alt)] bg-[var(--surface)]">
				{season.rules ? (
					<div
						className="
							[&_:first-child]:mt-0
							[&_h2]:mt-8
							[&_h2]:mb-3
							[&_h2]:font-[family-name:var(--font-serif)]
							[&_h2]:text-2xl
							[&_h3]:mb-2
							[&_h3]:mt-8
							[&_h3]:font-[family-name:var(--font-serif)]
							[&_h3]:text-xl
							[&_p]:my-4
							[&_ul]:my-4
							[&_ul]:list-disc
							[&_ul]:pl-6
							[&_ol]:my-4
							[&_ol]:list-decimal
							[&_ol]:pl-6
							[&_li]:my-2
							[&_strong]:font-semibold
						"
						dangerouslySetInnerHTML={{
							__html: season.rules,
						}}
					/>
				) : (
					<div className="rounded-lg border border-[var(--surface-alt)] bg-[var(--surface)] p-8 text-center">
						<p className="text-[var(--text-muted)]">
							No rules have been published for this season.
						</p>
					</div>
				)}
			</section>
		</main>
	);
}