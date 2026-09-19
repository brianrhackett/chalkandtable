import Logo from './Logo'
import Link from 'next/link'

export default function Footer() {
	return (
		<footer className="border-t border-white/10 bg-[var(--surface)]">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
                <Link href="/" aria-label="Chalk & Table">
                    <div className="font-[family-name:var(--font-display)] text-xl uppercase tracking-wide text-[var(--text-muted)]">
                        Chalk		
                        <span className="text-[var(--accent)]">
                            &
                        </span>
                        Table
                    </div>
                </Link>
                <span className="text-[var(--text-muted)]">
                    League management made simple
                </span>
            </div>
        </footer>
    )
}