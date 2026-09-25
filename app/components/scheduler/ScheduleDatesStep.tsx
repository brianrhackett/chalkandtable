type ScheduleDatesStepProps = {
	dayOfWeek: string;
	startDate: string;
	onDayOfWeekChange: (value: string) => void;
	onStartDateChange: (value: string) => void;
	onBack: () => void;
	onContinue: () => void;
};

const days = [
	"Sunday",
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
];

const dayIndexes: Record<string, number> = {
	sunday: 0,
	monday: 1,
	tuesday: 2,
	wednesday: 3,
	thursday: 4,
	friday: 5,
	saturday: 6,
};

export default function ScheduleDatesStep({
	dayOfWeek,
	startDate,
	onDayOfWeekChange,
	onStartDateChange,
	onBack,
	onContinue,
}: ScheduleDatesStepProps) {

    const selectedDate = startDate
        ? new Date(`${startDate}T00:00:00`)
        : null;

    const dateMatchesDay =
        !selectedDate ||
        !dayOfWeek ||
        selectedDate.getDay() === dayIndexes[dayOfWeek];

    const canContinue =
        dayOfWeek !== "" &&
        startDate !== "" &&
        dateMatchesDay;

	return (
		<div>
			<div className="mb-6">
				<h3 className="font-semibold">
					When does your league play?
				</h3>

				<p className="mt-1 text-sm opacity-70">
					Choose the regular night of the week and the
					first date of the season.
				</p>
			</div>

			<div className="grid gap-5 sm:grid-cols-2">
				<div>
					<label
						htmlFor="schedule-day"
						className="mb-2 block text-sm font-semibold"
					>
						Day of Week
					</label>

					<select
						id="schedule-day"
						value={dayOfWeek}
						onChange={(e) =>
							onDayOfWeekChange(e.target.value)
						}
						className="form-input"
					>
						<option value="">
							Select a day
						</option>

						{days.map((day) => (
							<option
								key={day}
								value={day.toLowerCase()}
							>
								{day}
							</option>
						))}
					</select>
				</div>

				<div>
					<label
						htmlFor="schedule-start-date"
						className="mb-2 block text-sm font-semibold"
					>
						First Week
					</label>

					<input
						id="schedule-start-date"
						type="date"
						value={startDate}
						onChange={(e) =>
							onStartDateChange(e.target.value)
						}
						className="form-input"
					/>

                    {startDate && dayOfWeek && !dateMatchesDay && (
                        <p className="mt-2 text-sm text-red-500">
                            The first date must be a{" "}
                            {dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1)}.
                        </p>
                    )}
				</div>
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