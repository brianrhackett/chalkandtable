export type PlayoffRoundConfig = {
    round: number;
    name: string;
    bestOf: number | null;
};

type PlayoffRoundFormatStepProps = {
    rounds: PlayoffRoundConfig[];
    onChange: (rounds: PlayoffRoundConfig[]) => void;
    onBack: () => void;
    onContinue: () => void;
};

export default function PlayoffRoundFormatStep({
    rounds,
    onChange,
    onBack,
    onContinue,
}: PlayoffRoundFormatStepProps) {
    function setBestOf(round: number, bestOf: number) {
        onChange(
            rounds.map((config) =>
                config.round === round
                    ? { ...config, bestOf }
                    : config
            )
        );
    }

    const complete = rounds.every(
        (round) => round.bestOf !== null
    );

    return (
        <div>
            <div className="mb-6">
                <h3 className="font-semibold">
                    How are your playoff rounds played?
                </h3>

                <p className="mt-1 text-sm text-[var(--text-muted)]">
                    Choose how many matches are required to win each
                    playoff series.
                </p>
            </div>

            <div className="space-y-6">
                {rounds.map((round) => (
                    <div key={round.round}>
                        <p className="mb-3 font-semibold">
                            {round.name}
                        </p>

                        <div className="grid grid-cols-4 gap-3">
                            {[1, 3, 5, 7].map((bestOf) => (
                                <button
                                    key={bestOf}
                                    type="button"
                                    onClick={() =>
                                        setBestOf(
                                            round.round,
                                            bestOf
                                        )
                                    }
                                    className={`rounded-lg border p-4 text-center transition ${
                                        round.bestOf === bestOf
                                            ? "border-[var(--accent)] bg-[var(--background-muted)]"
                                            : "border-black/10"
                                    }`}
                                >
                                    {bestOf === 1
                                        ? "Single Match"
                                        : `Best of ${bestOf}`}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
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
                    disabled={!complete}
                    onClick={onContinue}
                >
                    Continue
                </button>
            </div>
        </div>
    );
}