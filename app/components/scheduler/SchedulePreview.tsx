import type {
	GeneratedSchedule,
} from "@/src/lib/scheduler/generateRoundRobinSchedule";

type Team = {
	id: number;
	name: string;
	venueId: number | null;
};

type SchedulePreviewProps = {
	schedule: GeneratedSchedule;
	teams: Team[];
	isSaving: boolean;
	error: string | null;
	onBack: () => void;
	onSave: () => void;
};

function formatDate(value: string) {
	return new Date(
		`${value}T00:00:00`
	).toLocaleDateString("en-US", {
		weekday: "long",
		month: "long",
		day: "numeric",
		year: "numeric",
	});
}

export default function SchedulePreview({
	schedule,
	teams,
	isSaving,
	error,
	onBack,
	onSave,
}: SchedulePreviewProps) {
	const teamNames = new Map(
		teams.map((team) => [
			team.id,
			team.name,
		])
	);

	return (
		<div>
			<div className="mb-6">
				<h2 className="text-xl font-semibold">
					Schedule Preview
				</h2>

				<p className="mt-1 text-sm opacity-70">
					Review the generated schedule before saving it.
				</p>
			</div>

			<div className="space-y-6">
				{schedule.weeks.map((week) => (
					<div
						key={week.week}
						className="rounded-lg border border-black/10 p-4"
					>
						<div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
							<h3 className="font-semibold">
								Week {week.week}
							</h3>

							<span className="text-sm opacity-70">
								{formatDate(week.date)}
							</span>
						</div>

						<div className="divide-y divide-black/10">
							{week.matches.map((match) => (
								<div
									key={`${match.homeTeamId}-${match.awayTeamId}`}
									className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 py-3"
								>
									<div className="text-right font-semibold">
										{teamNames.get(
											match.awayTeamId
										)}
									</div>

									<div className="text-xs font-semibold uppercase opacity-50">
										@
									</div>

									<div className="font-semibold">
										{teamNames.get(
											match.homeTeamId
										)}
									</div>
								</div>
							))}
						</div>

						{week.byeTeamId !== null && (
							<div className="mt-3 border-t border-black/10 pt-3 text-sm opacity-70">
								<span className="font-semibold">
									Bye:
								</span>{" "}
								{teamNames.get(
									week.byeTeamId
								)}
							</div>
						)}
					</div>
				))}
			</div>

			{error && (
				<div className="mt-6 rounded-md bg-red-500/10 px-4 py-3 text-sm text-red-500">
					{error}
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
					onClick={onSave}
				>
					{isSaving
						? "Saving..."
						: "Save Schedule"}
				</button>
			</div>
		</div>
	);
}