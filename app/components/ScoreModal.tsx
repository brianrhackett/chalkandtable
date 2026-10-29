"use client";

import { useState, useTransition  } from "react";
import { saveMatchScore } from "@/src/lib/leagues/matches/saveMatchScore";
import { DiamondPlus } from "lucide-react";

type ScoreModalProps = {
    matchId: number;
    homeTeam: {
        name: string;
    };
    awayTeam: {
        name: string;
    };
    homeScore?: number | null;
    awayScore?: number | null;
};

export default function ScoreModal({
    matchId,
    homeTeam,
    awayTeam,
    homeScore = null,
    awayScore = null,
}: ScoreModalProps) {
    const [open, setOpen] = useState(false);

    const [homeScoreInput, setHomeScoreInput] = useState(
        homeScore?.toString() ?? ""
    );

    const [awayScoreInput, setAwayScoreInput] = useState(
        awayScore?.toString() ?? ""
    );

    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const hasScore =
        homeScore !== null &&
        awayScore !== null;

    function openModal() {
        setHomeScoreInput(homeScore?.toString() ?? "");
        setAwayScoreInput(awayScore?.toString() ?? "");
        setOpen(true);
    }

    function closeModal() {
        setOpen(false);
    }

    function handleSave() {
        setError(null);

        if (
            homeScoreInput === "" ||
            awayScoreInput === ""
        ) {
            setError("Enter both scores.");
            return;
        }

        const newHomeScore = Number(homeScoreInput);
        const newAwayScore = Number(awayScoreInput);

        startTransition(async () => {
            const result = await saveMatchScore(
                matchId,
                newHomeScore,
                newAwayScore
            );

            if (!result.success) {
                setError(result.error ?? "Unable to save score.");
                return;
            }

            setOpen(false);
        });
    }

    return (
        <>
            <button
                type="button"
                onClick={openModal}
                className="text-sm font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)] cursor-pointer"
            >
                <DiamondPlus
                    className="inline size-4"
                />
                {hasScore ? " Edit Score" : " Enter Score"}
            </button>

            {open && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onClick={closeModal}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="score-modal-title"
                        className="w-full max-w-md rounded-xl border border-[var(--surface-alt)] bg-[var(--surface)] p-6 shadow-xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="mb-6 flex items-center justify-between">
                            <h2
                                id="score-modal-title"
                                className="text-xl font-semibold"
                            >
                                {hasScore ? "Edit Score" : "Enter Score"}
                            </h2>

                            <button
                                type="button"
                                onClick={closeModal}
                                className="text-xl text-[var(--text-muted)] hover:text-[var(--text)]"
                                aria-label="Close"
                            >
                                &times;
                            </button>
                        </div>

                        <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-4">
                            <ScoreInput
                                teamName={awayTeam.name}
                                value={awayScoreInput}
                                onChange={setAwayScoreInput}
                            />

                            <span className="pb-3 text-xl text-[var(--text-muted)]">
                                &ndash;
                            </span>

                            <ScoreInput
                                teamName={homeTeam.name}
                                value={homeScoreInput}
                                onChange={setHomeScoreInput}
                            />
                        </div>

                        {error && (
                            <p className="mt-4 text-sm text-[var(--danger)]">
                                {error}
                            </p>
                        )}

                        <div className="mt-8 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="btn-tertiary"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={isPending}
                                className="btn-primary"
                            >
                                {isPending ? "Saving..." : "Save Score"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function ScoreInput({
    teamName,
    value,
    onChange,
}: {
    teamName: string;
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <label className="flex min-w-0 flex-col items-center gap-2">
            <span className="w-full truncate text-center text-sm font-medium">
                {teamName}
            </span>

            <input
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="w-20 form-input font-[family-name:var(--font-mono)] text-2xl font-semibold"
            />
        </label>
    );
}