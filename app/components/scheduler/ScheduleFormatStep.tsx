import type { ScheduleFormat } from "../ScheduleEditor";

type ScheduleFormatStepProps = {
	format: ScheduleFormat | null;
	maxWeeks: number | null;
	onFormatChange: (format: ScheduleFormat) => void;
	onMaxWeeksChange: (weeks: number | null) => void;
	onBack: () => void;
	onContinue: () => void;
};

export default function ScheduleFormatStep({
	format,
	maxWeeks,
	onFormatChange,
	onMaxWeeksChange,
	onBack,
	onContinue,
}: ScheduleFormatStepProps) {
	const canContinue =
		format !== null &&
		(format !== "fixed" || (maxWeeks !== null && maxWeeks > 0));

	return (
		<div>
			<div className="mb-6">
				<h3 className="font-semibold">
					How should teams play each other?
				</h3>

				<p className="mt-1 text-sm opacity-70">
					Choose how the round-robin schedule should be
					structured.
				</p>
			</div>

			<div className="space-y-3">
				<label className="flex cursor-pointer gap-3 rounded-lg border border-black/10 p-4">
					<input
						type="radio"
						name="schedule-format"
						checked={format === "single"}
						onChange={() =>
							onFormatChange("single")
						}
					/>

					<span>
						<span className="block font-semibold">
							Single Round Robin
						</span>

						<span className="mt-1 block text-sm opacity-70">
							Each team plays every other team once.
						</span>
					</span>
				</label>

				<label className="flex cursor-pointer gap-3 rounded-lg border border-black/10 p-4">
					<input
						type="radio"
						name="schedule-format"
						checked={format === "home-away"}
						onChange={() =>
							onFormatChange("home-away")
						}
					/>

					<span>
						<span className="block font-semibold">
							Home & Away
						</span>

						<span className="mt-1 block text-sm opacity-70">
							Each team plays every other team twice,
							once at home and once away.
						</span>
					</span>
				</label>

				<label className="flex cursor-pointer gap-3 rounded-lg border border-black/10 p-4">
					<input
						type="radio"
						name="schedule-format"
						checked={format === "fixed"}
						onChange={() =>
							onFormatChange("fixed")
						}
					/>

					<span className="flex-1">
						<span className="block font-semibold">
							Fixed Number of Weeks
						</span>

						<span className="mt-1 block text-sm opacity-70">
							Continue through the round-robin rotation
							until the selected number of weeks is
							reached.
						</span>

						{format === "fixed" && (
							<div className="mt-4 max-w-40">
								<label
									htmlFor="max-weeks"
									className="mb-2 block text-sm font-semibold"
								>
									Number of Weeks
								</label>

								<input
									id="max-weeks"
									type="number"
									min="1"
									value={maxWeeks ?? ""}
									onChange={(e) => {
										const value = Number(
											e.target.value
										);

										onMaxWeeksChange(
											value > 0 ? value : null
										);
									}}
									className="form-input"
								/>
							</div>
						)}
					</span>
				</label>
			</div>

			<div className="mt-6 flex justify-between">
				<button
					type="button"
					className="btn-secondary"
					onClick={onBack}
				>
					Back
				</button>

				<button
					type="button"
					className="btn-primary"
					onClick={onContinue}
					disabled={!canContinue}
				>
					Continue
				</button>
			</div>
		</div>
	);
}