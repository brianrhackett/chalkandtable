"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Season = {
    id: number;
    name: string;
    slug: string;
    active: boolean;
};

type SeasonSelectProps = {
    seasons: Season[];
    selectedSeason: Season;
};

export default function SeasonSelect({
    seasons,
    selectedSeason,
}: SeasonSelectProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    function handleChange(seasonSlug: string) {
        const params = new URLSearchParams(searchParams.toString());

        const season = seasons.find(
            (season) => season.slug === seasonSlug
        );

        if (!season) {
            return;
        }

        // Active season is the default, so it doesn't need
        // to appear in the URL.
        if (season.active) {
            params.delete("season");
        } else {
            params.set("season", season.slug);
        }

        const query = params.toString();

        router.push(query ? `${pathname}?${query}` : pathname);
    }

    return (
        <div className="flex items-center gap-3">
            <label
                htmlFor="season"
                className="text-sm font-medium"
            >
                Season
            </label>

            <select
                id="season"
                value={selectedSeason.slug}
                onChange={(e) => handleChange(e.target.value)}
                className="rounded-md border border-[var(--surface-alt)] px-3 py-2 bg-[var(--surface)]"
            >
                {seasons.map((season) => (
                    <option
                        key={season.id}
                        value={season.slug}
                        className="font-[family-name:var(--font-sans)]"
                    >
                        {season.name}
                        {season.active ? " (Current)" : ""}
                    </option>
                ))}
            </select>
        </div>
    );
}