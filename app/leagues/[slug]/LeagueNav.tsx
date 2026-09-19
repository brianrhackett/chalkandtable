"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { canManageLeague } from "@/src/lib/permissions/league";

type LeagueNavProps = {
	league: {
		slug: string;
        playerStatsEnabled: boolean;
	};
	role: string | null;
};

export default function LeagueNav({
	league,
	role,
}: LeagueNavProps) {
	const baseUrl = `/leagues/${league.slug}`;
	const pathname = usePathname();
	console.log(pathname);
	const links = [
		{
			label: "Home",
			href: baseUrl,
		},
		{
			label: "Standings",
			href: `${baseUrl}/standings`,
		},
		{
			label: "Schedule",
			href: `${baseUrl}/schedule`,
		},
		{
			label: "Teams",
			href: `${baseUrl}/teams`,
		},
	];

	return (
		<nav className="border-b border-[var(--surface-alt)] bg-[var(--surface)]">
			<div className="mx-auto flex max-w-7xl items-center gap-7 overflow-x-auto px-6">
				{links.map((link) => {
					const isActive = pathname === link.href;

					return (
						<Link
							key={link.href}
							href={link.href}
							className={`whitespace-nowrap border-b-2 py-4 text-sm font-semibold transition-colors ${
								isActive
									? "border-[var(--accent)] text-[var(--accent)]"
									: "border-transparent text-[var(--text-muted)] hover:text-[var(--text)]"
								}`}
						>
							{link.label}
						</Link>
					)
					
				})}

                {league.playerStatsEnabled && (
                    <Link
                        href={`${baseUrl}/players`}
                        className={`whitespace-nowrap border-b-2 py-4 text-sm font-semibold transition-colors ${
								pathname === `${baseUrl}/players`
									? "border-[var(--accent)] text-[var(--accent)]"
									: "border-transparent text-[var(--text-muted)] hover:text-[var(--text)]"
								}`}
					>
                        Players
                    </Link>
                )}

				{role && canManageLeague(role) && (
					<Link
						href={`${baseUrl}/settings`}
						className={`ml-auto whitespace-nowrap border-b-2 py-4 text-sm font-semibold transition-colors ${
								pathname === `${baseUrl}/settings`
									? "border-[var(--accent)] text-[var(--accent)]"
									: "border-transparent text-[var(--text-muted)] hover:text-[var(--text)]"
								}`}
					>
						Settings
					</Link>
				)}
			</div>
		</nav>
	);
}