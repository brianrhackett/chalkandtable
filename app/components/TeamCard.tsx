import Link from "next/link";
import { MapPin } from "lucide-react";


type TeamCardProps = {
	team: {
		id: number;
		name: string;
		slug: string;
		venue: {
			name: string;
		} | null;
		wins: number;
		losses: number;
		percentage: number;
	};
	leagueSlug: string;
    seasonSlug?: string;
};

export default function TeamCard({
    team,
	leagueSlug,
    seasonSlug,
}: TeamCardProps) {
    const href =
        `/leagues/${leagueSlug}/teams/${team.slug}` +
        (seasonSlug ? `?season=${seasonSlug}` : "");

    return (
        <Link
            key={team.id}
            href={href}
            className="group rounded-md border border-[var(--surface-alt)] bg-[var(--surface)] p-6 transition-colors hover:border-[var(--accent)]"
        >
            <div className="flex min-h-32">
                <div className="flex-1 pr-6">
                    <h2 className="font-[family-name:var(--font-serif)] text-2xl font-semibold transition-colors group-hover:text-[var(--accent)]">
                        {team.name}
                    </h2>

                    {team.venue && (
                        <div className="mt-4 flex items-center gap-2 text-sm text-[var(--text-muted)]">
                            <MapPin
                                size={16}
                                strokeWidth={1.75}
                                className="shrink-0 text-[var(--accent)]"
                            />

                            <span>
                                {team.venue.name}
                            </span>
                        </div>
                    )}
                </div>

                <div className="w-24 shrink-0 border-l border-[var(--surface-alt)] pl-6">
                    <p className="text-xs uppercase tracking-wider text-[var(--text-muted)]">
                        W &ndash; L
                    </p>

                    <p className="mt-1 font-[family-name:var(--font-mono)] text-lg font-semibold">
                        {team.wins} &ndash; {team.losses}
                    </p>

                    <p className="mt-4 text-xs text-[var(--text-muted)]">
                        Pct
                    </p>

                    <p className="mt-1 font-[family-name:var(--font-mono)] font-semibold">
                        {team.percentage
                            .toFixed(3)
                            .replace(/^0/, "")}
                    </p>
                </div>
            </div>
        </Link>
    )
}    