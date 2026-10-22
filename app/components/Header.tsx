import Logo from './Logo'
import Link from 'next/link'
import { auth } from "@/auth";

export default async function Header() {
    const session = await auth();

    return(
        <header className="border-b border-white/10">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
                <Link href="/" aria-label="Chalk & Table">
                    <Logo />
                </Link>
                
                <nav className="flex items-center gap-8 font-[family-name:var(--font-sans)] text-sm">
					<Link
						href="/#features"
						className="text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
					>
						Features
					</Link>

					<Link
						href="/#leagues"
						className="text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
					>
						For Leagues
					</Link>

                    { !session?.user ? (
                        <Link
                            href="/login"
                            className="btn-primary"
                        >
                            Sign In
                        </Link>
                    ) : (
                        <>
                        <Link
                            href="/dashboard"
                            className="text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
                        >
                            Dashboard
                        </Link>
                        <Link
                            href="/login"
                            className="btn-secondary"
                        >
                            Sign Out
                        </Link>
                        </>
                    )}
					
				</nav>
            </div>
        </header>
    )
}