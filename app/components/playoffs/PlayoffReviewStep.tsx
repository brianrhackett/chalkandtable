import type { PlayoffRoundConfig } from "./PlayoffRoundFormatStep";

type PlayoffReviewStepProps = {
    teamCount: number;
    rounds: PlayoffRoundConfig[];
    reseed: boolean;
    onBack: () => void;
    onSave: () => void;
    isSaving: boolean;
    error: string | null;
};

export default function PlayoffReviewStep({
    teamCount,
    rounds,
    reseed,
    onBack,
    onSave,
    isSaving,
    error,
}: PlayoffReviewStepProps) {
    return (
        <div>
            <div className="mb-6">
                <h3 className="font-semibold">
                    Review your playoff format
                </h3>

                <p className="mt-1 text-sm text-[var(--text-muted)]">
                    Make sure everything looks right before saving.
                </p>
            </div>

            <div className="divide-y divide-black/10 rounded-lg border border-black/10">
                <div className="flex items-center justify-between p-4">
                    <span className="text-sm text-[var(--text-muted)]">
                        Playoff teams
                    </span>

                    <span className="font-semibold">
                        {teamCount}
                    </span>
                </div>

                <div className="flex items-center justify-between p-4">
                    <span className="text-sm text-[var(--text-muted)]">
                        Reseeding
                    </span>

                    <span className="font-semibold">
                        {reseed ? "Yes" : "No"}
                    </span>
                </div>

                {rounds.map((round) => (
                    <div
                        key={round.round}
                        className="flex items-center justify-between p-4"
                    >
                        <span className="text-sm text-[var(--text-muted)]">
                            {round.name}
                        </span>

                        <span className="font-semibold">
                            {round.bestOf === 1
                                ? "Single Match"
                                : `Best of ${round.bestOf}`}
                        </span>
                    </div>
                ))}
            </div>

            {error && (
                <p className="mt-4 text-sm text-red-600">
                    {error}
                </p>
            )}

            <div className="mt-8 flex justify-between">
                <button
                    type="button"
                    className="btn-secondary"
                    onClick={onBack}
                    disabled={isSaving}
                >
                    Back
                </button>

                <button
                    type="button"
                    className="btn-primary"
                    onClick={onSave}
                    disabled={isSaving}
                >
                    {isSaving
                        ? "Saving..."
                        : "Save Playoff Format"}
                </button>
            </div>
        </div>
    );
}