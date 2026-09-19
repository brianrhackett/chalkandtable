import Link from "next/link";

type LeagueHeaderProps = {
	league: {
		name: string;
		slug: string;
	};
	season?: {
		name: string;
	} | null;
};

export default function LeagueHeader({
	league,
	season,
}: LeagueHeaderProps) {
	return (
		<header className="border-b border-[var(--surface-alt)] bg-[var(--surface)]">
			<div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
				<div>
					<Link
						href={`/leagues/${league.slug}`}
						className="font-[family-name:var(--font-serif)] text-3xl font-bold text-[var(--accent)]"
					>
						{league.name}
					</Link>

					{season && (
						<p className="mt-1 text-sm text-[var(--text-muted)]">
							{season.name}
						</p>
					)}
				</div>

				<div className="flex items-center gap-5 text-sm">
					<Link
						href="/dashboard"
						className="text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
					>
						Dashboard
					</Link>

					<span className="text-lg uppercase font-[family-name:var(--font-display)] text-[var(--text-muted)]">
						Chalk
						<span className="text-[var(--accent)]">&amp;</span>
						Table
					</span>
				</div>
			</div>
		</header>
	);
}