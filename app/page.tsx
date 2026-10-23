import Header from './components/Header';
import Footer from './components/Footer';
import Card from './components/Card';
import Link from 'next/link';

import {
	CalendarDays,
	History,
	Trophy,
	UsersRound,
	Check,
} from "lucide-react";

const features = [
	{
		title: "Multi-Season Support",
		description:
			"Run multiple seasons within one league. Archive old seasons and keep historical records intact.",
		icon: History,
	},
	{
		title: "Team & Player Rosters",
		description:
			"Manage teams, venues, and player rosters from one place.",
		icon: UsersRound,
	},
	{
		title: "Flexible Scheduling",
		description:
			"Generate a balanced schedule automatically or import an existing schedule from CSV.",
		icon: CalendarDays,
	},
	{
		title: "Scores & Standings",
		description:
			"Enter match results and keep league standings up to date automatically.",
		icon: Trophy,
	},
];

const matches = [
	{
		homeTeam: "Totally Cueless",
		awayTeam: "Rackless Behavior",
	},
	{
		homeTeam: "Rack Attack",
		awayTeam: "Felt Fellas",
	},
	{
		homeTeam: "Bank Shot Bandits",
		awayTeam: "Rack 'n' Rollas",
	},
	{
		homeTeam: "Magic 8 Balls",
		awayTeam: "Good Feltas",
	},
	{
		homeTeam: "Cue-ella Deville",
		awayTeam: "Pocket Change",
	},
]

export default function Home() {
	return (
		<>
		<Header />
			<main className="px-6">
				<section className="py-16 sm:py-24 mx-auto max-w-5xl">
					<h2 className="font-[family-name:var(--font-display)] text-8xl">
						Run Your League, 
						<span className="block text-[var(--accent)]">Not a Spreadsheet</span>
					</h2>

					<p className="my-8 text-2xl leading-relaxed text-[var(--text-muted)] max-w-3xl">
						Manage your 8-ball, 9-ball, or any pool league &ndash; teams, rosters, 
						and auto-generated schedules all under one roof.
					</p>

					<div className="">
						<Link
							href="/register"
							className="btn-primary"
						>
							Create an account &rarr;
						</Link>
					</div>
				</section>

				<hr className="border-t border-white/10" />

				<section id="features" className="py-24 mx-auto max-w-7xl">
					<h3 className="font-[family-name:var(--font-display)] text-6xl">
						Everything you need
					</h3>
					<p className="my-8 text-lg leading-relaxed text-[var(--text-muted)]">
						Built for pool league organizers who want results, not complexity
					</p>

					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
						{features.map((feature) => (
							<Card
								key={feature.title}
								title={feature.title}
								icon={feature.icon}
							>
								{feature.description}
							</Card>
						))}
					</div>

				</section>

				<hr className="border-t border-white/10" />

				<section id="leagues" className="py-24 mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-6">
					<div className="rounded-md border border-white/10 bg-[var(--surface)] p-6">
						<div className="font-[family-name:var(--font-mono)] text-center mb-8">
							Week 4 &sdot; Thursday, Oct 22
						</div>
						<div className="divide-y divide-[var(--surface-alt)]">
							{matches.map((match) => (
								<div key="{match.id}" className="grid grid-cols-3 py-4">
									<span>{match.homeTeam}</span>
									<span className="text-center"> vs </span>
									<span className="text-right">{match.awayTeam}</span>
								</div>
							))}
						</div>
					</div>
					<div>
						<h3 className="font-[family-name:var(--font-display)] text-6xl">
							Built around your league
						</h3>
						<p className="my-8 text-lg leading-relaxed text-[var(--text-muted)]">
							Your league already has its own way of doing things.<br/>
							Chalk & Table works with it.
						</p>

						<h4 className="font-[family-name:var(--font-display)] text-4xl">
							Generate it. Import it. Make it yours.
						</h4>

						<p className="my-8 text-lg leading-relaxed text-[var(--text-muted)]">
							Generate a balanced round-robin schedule automatically,
							or bring in the schedule your league already uses with CSV.
						</p>

						<div><Check className="text-[var(--accent)] inline" /> Shared venue conflicts</div>
						<div><Check className="text-[var(--accent)] inline" /> Byes for odd team counts</div>
						<div><Check className="text-[var(--accent)] inline" /> Home and away balancing</div>
						<div><Check className="text-[var(--accent)] inline" /> Existing schedules via CSV</div>
					</div>
				</section>
			</main>
		<Footer />
		</>
	);
}
