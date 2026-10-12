type PlayoffEnabledStepProps = {
    value: boolean | null;
    onChange: (value: boolean) => void;
    onContinue: () => void;
};

export default function PlayoffEnabledStep({
    value,
    onChange,
    onContinue,
}: PlayoffEnabledStepProps) {
    return (
        <div>
            <div className="mb-6">
                <h3 className="font-semibold">
                    Does your league have playoffs?
                </h3>

                <p className="mt-1 text-sm text-[var(--text-muted)]">
                    Choose how your league determines its champion.
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
                        Yes, this is America
                    </span>

                    <span className="mt-1 block text-sm text-[var(--text-muted)]">
                        Qualifying teams advance to a postseason playoff.
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
                        No, we crown our champion European soccer style
                    </span>

                    <span className="mt-1 block text-sm text-[var(--text-muted)]">
                        The regular-season standings determine the champion.
                    </span>
                </button>
            </div>

            <div className="mt-6 flex justify-end">
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