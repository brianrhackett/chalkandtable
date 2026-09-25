import type { ScheduleFormat } from "../ScheduleEditor";

type ScheduleReviewStepProps = {
	teamCount: number;
	dayOfWeek: string;
	startDate: string;
	excludedDates: string[];
	format: ScheduleFormat;
	maxWeeks: number | null;
	onBack: () => void;
	onGenerate: () => void;
};

const formatLabels: Record<ScheduleFormat, string> = {
	single: "Single Round Robin",
	"home-away": "Home & Away",
	fixed: "Fixed Number of Weeks",
};

function formatDate(value: string) {
	return new Date(`${value}T00:00:00`).toLocaleDateString(
		"en-US",
		{
			month: "long",
			day: "numeric",
			year: "numeric",
		}
	);
}

export default function ScheduleReviewStep({
	teamCount,
	dayOfWeek,
	startDate,
	excludedDates,
	format,
	maxWeeks,
	onBack,
	onGenerate,
}: ScheduleReviewStepProps) {
	const roundsPerCycle =
		teamCount % 2 === 0
			? teamCount - 1
			: teamCount;

	const totalWeeks =
		format === "single"
			? roundsPerCycle
			: format === "home-away"
				? roundsPerCycle * 2
				: maxWeeks;

	return (
		<div>
			<div className="mb-6">
				<h3 className="font-semibold">
					Ready to generate your schedule?
				</h3>

				<p className="mt-1 text-sm opacity-70">
					Review the schedule settings before continuing.
				</p>
			</div>

			<dl className="divide-y divide-black/10">
				<div className="flex justify-between gap-4 py-3">
					<dt className="opacity-70">Teams</dt>
					<dd className="font-semibold">
						{teamCount}
					</dd>
				</div>

				<div className="flex justify-between gap-4 py-3">
					<dt className="opacity-70">League Night</dt>
					<dd className="font-semibold capitalize">
						{dayOfWeek}
					</dd>
				</div>

				<div className="flex justify-between gap-4 py-3">
					<dt className="opacity-70">First Week</dt>
					<dd className="font-semibold">
						{formatDate(startDate)}
					</dd>
				</div>

				<div className="flex justify-between gap-4 py-3">
					<dt className="opacity-70">Format</dt>
					<dd className="font-semibold">
						{formatLabels[format]}
					</dd>
				</div>

				<div className="flex justify-between gap-4 py-3">
					<dt className="opacity-70">
						Schedule Length
					</dt>
					<dd className="font-semibold">
						{totalWeeks} weeks
					</dd>
				</div>

				<div className="flex justify-between gap-4 py-3">
					<dt className="opacity-70">
						Excluded Dates
					</dt>
					<dd className="font-semibold">
						{excludedDates.length}
					</dd>
				</div>
			</dl>

			{excludedDates.length > 0 && (
				<div className="mt-5">
					<p className="mb-2 text-sm font-semibold">
						Dates skipped
					</p>

					<div className="flex flex-wrap gap-2">
						{excludedDates.map((date) => (
							<span
								key={date}
								className="rounded-md bg-[var(--background-muted)] px-3 py-1 text-sm"
							>
								{formatDate(date)}
							</span>
						))}
					</div>
				</div>
			)}

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
					onClick={onGenerate}
				>
					Generate Schedule
				</button>
			</div>
		</div>
	);
}