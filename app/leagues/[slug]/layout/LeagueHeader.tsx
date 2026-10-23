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
			<div className="mx-auto flex max-w-7xl items-center justify-between px-0 py-6 flex-col sm:flex-row gap-5">
				<div className="order-2 sm:order-1 w-full sm:w-auto px-6">
					<Link
						href={`/leagues/${league.slug}`}
						className="font-[family-name:var(--font-serif)] text-2xl sm:text-3xl font-bold text-[var(--accent)]"
					>
						{league.name}
					</Link>

					{season && (
						<p className="mt-1 text-sm text-[var(--text-muted)]">
							{season.name}
						</p>
					)}
				</div>

				<div 
					className="flex items-center justify-between gap-5 text-sm order-1 sm:order-2
								border-b border-[var(--surface-alt)] sm:border-0
								pb-4 px-6 sm:pb-0 w-full sm:w-auto">
					<Link
						href="/dashboard"
						className="text-[var(--text-muted)] transition-colors hover:text-[var(--text)] order-2 sm:order-1"
					>
						Dashboard
					</Link>

					<span className="text-lg uppercase font-[family-name:var(--font-display)] text-[var(--text-muted)] order-1 sm:order-2">
						Chalk
						<span className="text-[var(--accent)]">&amp;</span>
						Table
					</span>
				</div>
			</div>
		</header>
	);
}