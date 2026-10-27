export type AdvancingTeam = {
    teamId: number;
    seed: number;
    seriesNumber: number;
};

export function pairPlayoffTeams(
    teams: AdvancingTeam[],
    reseed: boolean
): [AdvancingTeam, AdvancingTeam][] {
    if (
        teams.length < 2 ||
        teams.length % 2 !== 0
    ) {
        throw new Error(
            "Invalid number of advancing teams."
        );
    }

    if (reseed) {
        const sorted = [...teams].sort(
            (a, b) => a.seed - b.seed
        );

        return Array.from(
            { length: sorted.length / 2 },
            (_, index): [AdvancingTeam, AdvancingTeam] => [
                sorted[index],
                sorted[sorted.length - 1 - index],
            ]
        );
    }

    // Fixed bracket: preserve the original bracket paths.
    const sorted = [...teams].sort(
        (a, b) => a.seriesNumber - b.seriesNumber
    );

    const pairs: [AdvancingTeam, AdvancingTeam][] = [];

    for (
        let index = 0;
        index < sorted.length / 2;
        index++
    ) {
        pairs.push([
            sorted[index],
            sorted[sorted.length - 1 - index],
        ]);
    }

    return pairs;
}