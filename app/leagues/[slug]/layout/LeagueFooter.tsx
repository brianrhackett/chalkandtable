type LeagueFooterProps = {
	league: {
		name: string;
	};
};

export default function LeagueFooter({
	league,
}: LeagueFooterProps) {
	return (
		<footer className="mt-auto border-t border-[var(--surface-alt)]">
			<div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-6 text-xs text-[var(--text-muted)] sm:flex-row sm:items-center sm:justify-between">
				<p>{league.name}</p>

				<p>
					Powered by{" "}
					<span className="text-md font-[family-name:var(--font-display)] uppercase text-[var(--text)]">
						Chalk
						<span className="text-[var(--accent)]">&amp;</span>
						Table
					</span>
				</p>
			</div>
		</footer>
	);
}