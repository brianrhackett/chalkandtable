import type { LeagueStanding } from "./getLeagueStandings";

type CompletedMatch = {
	homeTeamId: number;
	awayTeamId: number;
	homeScore: number | null;
	awayScore: number | null;
};

type MiniTableRecord = {
	teamId: number;
	wins: number;
	losses: number;
};

function getMiniTable(
	teamIds: number[],
	matches: CompletedMatch[]
): MiniTableRecord[] {
	const teamIdSet = new Set(teamIds);

	const records = new Map<number, MiniTableRecord>();

	for (const teamId of teamIds) {
		records.set(teamId, {
			teamId,
			wins: 0,
			losses: 0,
		});
	}

	const headToHeadMatches = matches.filter(
		(match) =>
			teamIdSet.has(match.homeTeamId) &&
			teamIdSet.has(match.awayTeamId)
	);

	for (const match of headToHeadMatches) {
		if (
			match.homeScore === null ||
			match.awayScore === null
		) {
			continue;
		}

		const home = records.get(match.homeTeamId);
		const away = records.get(match.awayTeamId);

		if (!home || !away) {
			continue;
		}

		if (match.homeScore > match.awayScore) {
			home.wins++;
			away.losses++;
		} else {
			away.wins++;
			home.losses++;
		}
	}

	return [...records.values()];
}

export function rankStandings(
	standings: LeagueStanding[],
	matches: CompletedMatch[]
): LeagueStanding[] {
	const recordGroups = new Map<string, LeagueStanding[]>();
	
	for (const standing of standings) {
		const key = `${standing.wins}-${standing.losses}`;

		const group = recordGroups.get(key) ?? [];

		group.push(standing);

		recordGroups.set(key, group);
	}

	const groups = [...recordGroups.values()].sort(
		(a, b) => {
			const aStanding = a[0];
			const bStanding = b[0];

			return (
				bStanding.wins - aStanding.wins ||
				aStanding.losses - bStanding.losses
			);
		}
	);

	const ranked: LeagueStanding[] = [];

	for (const group of groups) {
		
		const rank = ranked.length + 1;

		if (group.length === 1) {
			ranked.push({
				...group[0],
				rank
			});
			continue;
		}

		const teamIds = group.map(
			(standing) => standing.teamId
		);

		const miniTable = getMiniTable(
			teamIds,
			matches
		);

		const miniTableByTeam = new Map(
			miniTable.map((record) => [
				record.teamId,
				record,
			])
		);

		group.sort((a, b) => {
			const aMini = miniTableByTeam.get(a.teamId);
			const bMini = miniTableByTeam.get(b.teamId);

			const miniTableDifference =
				(bMini?.wins ?? 0) -
				(aMini?.wins ?? 0);

			if (miniTableDifference !== 0) {
				return miniTableDifference;
			}

			if (a.racksWon !== b.racksWon) {
				return b.racksWon - a.racksWon;
			}

			return a.name.localeCompare(b.name);
		});

		for (const standing of group) {
			const previous = ranked.at(-1);

			let rank = ranked.length + 1;

			if (previous) {
				const standingMini = miniTableByTeam.get(
					standing.teamId
				);

				const previousMini = miniTableByTeam.get(
					previous.teamId
				);

				const isTied =
					standing.wins === previous.wins &&
					standing.losses === previous.losses &&
					(standingMini?.wins ?? 0) ===
						(previousMini?.wins ?? 0) &&
					standing.racksWon === previous.racksWon;

				if (isTied) {
					rank = previous.rank;
				}
			}

			ranked.push({
				...standing,
				rank,
			});
		}
	}

	return ranked;
}