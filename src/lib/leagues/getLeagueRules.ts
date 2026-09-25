import { db } from "@/src/prisma/db";

export async function getLeagueRules(
	slug: string,
	seasonSlug?: string
) {
	const league = await db.orm.public.League.first({
		slug,
	});

	if (!league) {
		return null;
	}

	const season = await db.orm.public.Season.first({
		leagueId: league.id,
    	...(seasonSlug
        	? { slug: seasonSlug }
        	: { active: true }),
	});

	if (!season) {
		return null;
	}

	const seasons = await db.orm.public.Season
		.where({
			leagueId: league.id,
		})
		.all();

	return {
		league,
		season,
		seasons
	};
}