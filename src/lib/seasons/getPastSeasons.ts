import { db } from "@/src/prisma/db";

export async function getPastSeasons(
	slug: string,
) {
	const league = await db.orm.public.League.first({
		slug,
	});

    if (!league) {
		return null;
	}

    const seasons = await db.orm.public.Season
		.where({
			leagueId: league.id,
            active: false,
		})
        .include("seasonTeams")
        .include("matches")
		.all();


    console.log(seasons);

    return {
		league,
		seasons,
	};
}