import type { LucideIcon } from "lucide-react";

type CardProps = {
	icon: LucideIcon;
	title: string;
	children: React.ReactNode;
};
export default function Card({
	icon: Icon,
    title,
	children,
}: CardProps) {
	return (
        <div className="rounded-md border border-white/10 bg-[var(--surface)] p-6">
			<Icon
				size={24}
				strokeWidth={1.75}
				className="mb-6 text-[var(--accent)]"
			/>

			<h3 className="mb-3 font-[family-name:var(--font-display)] text-2xl">
				{title}
			</h3>

			<div className="leading-relaxed text-[var(--text-muted)]">
				{children}
			</div>
		</div>
    );
}