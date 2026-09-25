type ExcludedDatesStepProps = {
	startDate: string;
	excludedDates: string[];
	onChange: (dates: string[]) => void;
	onBack: () => void;
	onContinue: () => void;
};

type MonthGroup = {
	key: string;
	label: string;
	dates: Date[];
};

function toDateString(date: Date) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");

	return `${year}-${month}-${day}`;
}

function getLeagueDates(startDate: string) {
	const start = new Date(`${startDate}T00:00:00`);
	const dates: Date[] = [];

	for (let i = 1; i <= 52; i++) {
		const date = new Date(start);
		date.setDate(start.getDate() + i * 7);

		dates.push(date);
	}

	return dates;
}

function groupDatesByMonth(dates: Date[]) {
	const groups = new Map<string, MonthGroup>();

	for (const date of dates) {
		const key = `${date.getFullYear()}-${date.getMonth()}`;

		if (!groups.has(key)) {
			groups.set(key, {
				key,
				label: date.toLocaleDateString("en-US", {
					month: "long",
					year: "numeric",
				}),
				dates: [],
			});
		}

		groups.get(key)!.dates.push(date);
	}

	return Array.from(groups.values());
}

export default function ExcludedDatesStep({
	startDate,
	excludedDates,
	onChange,
	onBack,
	onContinue,
}: ExcludedDatesStepProps) {
	const leagueDates = getLeagueDates(startDate);
	const months = groupDatesByMonth(leagueDates);

	function toggleDate(date: Date) {
		const value = toDateString(date);

		if (excludedDates.includes(value)) {
			onChange(
				excludedDates.filter(
					(excludedDate) => excludedDate !== value
				)
			);

			return;
		}

		onChange([...excludedDates, value].sort());
	}

	return (
		<div>
			<div className="mb-6">
				<h3 className="font-semibold">
					Are there any dates your league won't play?
				</h3>

				<p className="mt-1 text-sm opacity-70">
					Select any league nights that should be skipped.
					We've listed the next year of league dates, so
					you can ignore dates after your season is
					expected to end.
				</p>
			</div>

			<div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
				{months.map((month) => (
					<div key={month.key}>
						<h4 className="mb-3 font-semibold">
							{month.label}
						</h4>

						<div className="space-y-2">
							{month.dates.map((date) => {
								const value = toDateString(date);
								const checked =
									excludedDates.includes(value);

								return (
									<label
										key={value}
										className="flex cursor-pointer items-center gap-3"
									>
										<input
											type="checkbox"
											checked={checked}
											onChange={() => toggleDate(date)}
										/>

										<span className="text-sm">
											{date.toLocaleDateString(
												"en-US",
												{
													weekday: "short",
													month: "short",
													day: "numeric",
												}
											)}
										</span>
									</label>
								);
							})}
						</div>
					</div>
				))}
			</div>

			{excludedDates.length > 0 && (
				<p className="mt-6 text-sm opacity-70">
					{excludedDates.length}{" "}
					{excludedDates.length === 1 ? "date" : "dates"}{" "}
					excluded
				</p>
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
					onClick={onContinue}
				>
					Continue
				</button>
			</div>
		</div>
	);
}