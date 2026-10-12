type PlayoffTeamCountStepProps = {
    teamCount: number;
    value: number | null;
    onChange: (value: number) => void;
    onBack: () => void;
    onContinue: () => void;
};

export default function PlayoffTeamCountStep({
    teamCount,
    value,
    onChange,
    onBack,
    onContinue,
}: PlayoffTeamCountStepProps) {
    const options = Array.from(
        { length: teamCount - 1 },
        (_, index) => index + 2
    );

    return (
        <div>
            <div className="mb-6">
                <h3 className="font-semibold">
                    How many teams make the playoffs?
                </h3>

                <p className="mt-1 text-sm text-[var(--text-muted)]">
                    Choose how many teams qualify from the regular-season
                    standings.
                </p>
            </div>

            <select
                value={value ?? ""}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full rounded-lg border border-black/10 bg-[var(--background)] px-4 py-3"
            >
                <option value="">
                    Select number of teams
                </option>

                {options.map((count) => (
                    <option key={count} value={count}>
                        {count} teams
                    </option>
                ))}
            </select>

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
                    disabled={value === null}
                >
                    Continue
                </button>
            </div>
        </div>
    );
}