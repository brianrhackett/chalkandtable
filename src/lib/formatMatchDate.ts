export function formatMatchDate(
	date: string | { toString(): string }
) {
	return new Date(String(date)).toLocaleDateString(
		"en-US",
		{
			weekday: "long",
			month: "short",
			day: "numeric",
			timeZone: "UTC",
		}
	);
}