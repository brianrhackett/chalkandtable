import { db } from "@/src/prisma/db";

export async function isRegularSeasonComplete(
    seasonId: number
): Promise<boolean> {
    const matches = await db.orm.public.Match
        .where({
            seasonId,
        })
        .all();

    const regularSeasonMatches = matches.filter(
        (match) => match.week !== null
    );
	

    if (regularSeasonMatches.length === 0) {
        return false;
    }

    return regularSeasonMatches.every(
        (match) => match.status === "completed"
    );
}