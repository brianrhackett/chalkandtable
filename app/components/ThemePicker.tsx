import { themes } from "@/src/lib/themes";

type ThemePickerProps = {
	currentTheme: ThemeKey;
};

export default function ThemePicker({
	currentTheme,
}: ThemePickerProps) {
	return (
		<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
			{Object.entries(themes).map(([key, theme]) => (
				<label
					key={key}
					className="cursor-pointer"
				>
					<input
						type="radio"
						name="theme"
						value={key}
						defaultChecked={currentTheme === key}
						className="peer sr-only"
					/>

					<div 
                        className="w-full rounded-md border border-[var(--surface-alt)] p-3 transition-colors peer-checked:border-[var(--accent)] peer-checked:ring-1 peer-checked:ring-[var(--accent)]">
						<div
							className="flex h-12 items-center justify-center rounded-sm border border-black/10"
							style={{
								backgroundColor: theme.background,
							}}
						>
							<div
								className="h-5 w-10 rounded-sm"
								style={{
									backgroundColor: theme.accent,
								}}
							/>
						</div>

						<div className="mt-3">
							<p className="text-sm font-semibold">
								{theme.name}
							</p>

							<p className="text-xs capitalize text-[var(--text-muted)]">
								{theme.mode}
							</p>
						</div>
					</div>
				</label>
			))}
		</div>
	);
}