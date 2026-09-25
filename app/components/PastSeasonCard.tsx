import Link from "next/link";
import { Trophy } from "lucide-react";
type PastSeasonCardProps = {
	season: {
		id: number;
		name: string;
		slug: string;
	};
	leagueSlug: string;
};

export default function PastSeasonCard({
    season,
	leagueSlug,
}: PastSeasonCardProps) {
    return (
        <Link
            key={season.id}
            href={`/leagues/${leagueSlug}/seasons/${season.slug}`}
            className="group rounded-md border border-[var(--surface-alt)] bg-[var(--surface)] p-6 transition-colors hover:border-[var(--accent)]"
        >
            <div className="flex min-h-32">
                <div className="flex-1 pr-6">
                    <h2 className="font-[family-name:var(--font-serif)] text-2xl font-semibold transition-colors group-hover:text-[var(--accent)]">
                        {season.name}
                    </h2>
                    <div className="mt-4 flex items-center gap-2 text-sm text-[var(--text-muted)]">
                        {season.seasonTeams.length} Teams &sdot; {season.matches.length} matches
                    </div>
                </div>
            </div>
        </Link>
    )
}