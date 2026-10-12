type PlayoffReseedStepProps = {
    value: boolean | null;
    onChange: (value: boolean) => void;
    onBack: () => void;
    onContinue: () => void;
};

export default function PlayoffReseedStep({
    value,
    onChange,
    onBack,
    onContinue,
}: PlayoffReseedStepProps) {
    return (
        <div>
            <div className="mb-6">
                <h3 className="font-semibold">
                    Do you reseed after each round?
                </h3>

                <p className="mt-1 text-sm text-[var(--text-muted)]">
                    Reseeding matches the highest remaining seed
                    against the lowest remaining seed in the next round.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <button
                    type="button"
                    onClick={() => onChange(true)}
                    className={`rounded-lg border p-5 text-left transition ${
                        value === true
                            ? "border-[var(--accent)] bg-[var(--background-muted)]"
                            : "border-black/10"
                    }`}
                >
                    <span className="block font-semibold">
                        Yes, reseed
                    </span>

                    <span className="mt-1 block text-sm text-[var(--text-muted)]">
                        Rebuild each round based on the seeds of
                        the teams that advanced.
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() => onChange(false)}
                    className={`rounded-lg border p-5 text-left transition ${
                        value === false
                            ? "border-[var(--accent)] bg-[var(--background-muted)]"
                            : "border-black/10"
                    }`}
                >
                    <span className="block font-semibold">
                        No, fixed bracket
                    </span>

                    <span className="mt-1 block text-sm text-[var(--text-muted)]">
                        Winners advance through their original
                        side of the bracket.
                    </span>
                </button>
            </div>

            <div className="mt-8 flex justify-between">
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
                    disabled={value === null}
                    onClick={onContinue}
                >
                    Continue
                </button>
            </div>
        </div>
    );
}