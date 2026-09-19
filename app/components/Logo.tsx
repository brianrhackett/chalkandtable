type LogoProps = {
	className?: string
}

export default function Logo({
	className = '',
}: LogoProps) {
	return (
		<div className={`font-[family-name:var(--font-display)] text-3xl uppercase tracking-wide text-[var(--text)] ${className}`}>
	        Chalk		
            <span className="text-[var(--accent)]">
                &
			</span>
            Table
		</div>
	)
}