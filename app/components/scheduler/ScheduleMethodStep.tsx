import type { ScheduleMethod } from "../ScheduleEditor";

type ScheduleMethodStepProps = {
	value: ScheduleMethod | null;
	onChange: (value: ScheduleMethod) => void;
	onContinue: () => void;
};

export default function ScheduleMethodStep({
	value,
	onChange,
	onContinue,
}: ScheduleMethodStepProps) {
	return (
		<div>
			<div className="mb-6">
				<h3 className="font-semibold">
					How would you like to create your schedule?
				</h3>

				<p className="mt-1 text-sm opacity-70">
					Generate a new schedule automatically or import
					an existing schedule.
				</p>
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				<button
					type="button"
					onClick={() => onChange("generate")}
					className={`rounded-lg border p-5 text-left transition ${
						value === "generate"
							? "border-[var(--accent)] bg-[var(--background-muted)]"
							: "border-black/10"
					}`}
				>
					<span className="block font-semibold">
						Generate Schedule
					</span>

					<span className="mt-1 block text-sm opacity-70">
						Build a schedule automatically from your
						teams and venues.
					</span>
				</button>

				<button
					type="button"
					onClick={() => onChange("upload")}
					className={`rounded-lg border p-5 text-left transition ${
						value === "upload"
							? "border-[var(--accent)] bg-[var(--background-muted)]"
							: "border-black/10"
					}`}
				>
					<span className="block font-semibold">
						Upload CSV
					</span>

					<span className="mt-1 block text-sm opacity-70">
						Import a schedule you've already created.
					</span>
				</button>
			</div>

			<div className="mt-6 flex justify-end">
				<button
					type="button"
					className="btn-primary"
					onClick={onContinue}
					disabled={!value}
				>
					Continue
				</button>
			</div>
		</div>
	);
}