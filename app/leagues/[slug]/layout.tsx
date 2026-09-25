import { notFound } from "next/navigation";

import { auth } from "@/auth";
import LeagueFooter from "./layout/LeagueFooter";
import LeagueHeader from "./layout/LeagueHeader";
import LeagueNav from "./layout/LeagueNav";
import { db } from "@/src/prisma/db";

type LeagueLayoutProps = {
	children: React.ReactNode;
	params: Promise<{
		slug: string;
	}>;
};

export default async function LeagueLayout({
	children,
	params,
}: LeagueLayoutProps) {
	const { slug } = await params;

	const league = await db.orm.public.League.first({
		slug,
	});

	if (!league) {
		notFound();
	}

	const activeSeason = await db.orm.public.Season.first({
		leagueId: league.id,
		active: true,
	});

	const session = await auth();

	let role: string | null = null;

	if (session?.user?.email) {
		const user = await db.orm.public.User.first({
			email: session.user.email,
		});

		if (user) {
			const memberships = await db.orm.public.LeagueUser
				.where({
					userId: user.id,
					leagueId: league.id,
				})
				.all();

			role = memberships[0]?.role ?? null;
		}
	}

	return (
		<div
			data-theme={league.theme}
			className="flex min-h-screen flex-col bg-[var(--background)] text-[var(--text)]"
		>
			<LeagueHeader
				league={{
					name: league.name,
					slug: league.slug,
				}}
				season={activeSeason
					? {
						name: activeSeason.name,
					}
					: null
				}
			/>

			<LeagueNav
				league={{
					slug: league.slug,
                    playerStatsEnabled: league.playerStatsEnabled,
				}}
				role={role}
			/>

			<div className="flex-1">
				{children}
			</div>

			<LeagueFooter
				league={{
					name: league.name,
				}}
			/>
		</div>
	);
}