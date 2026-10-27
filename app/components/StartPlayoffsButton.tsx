"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { startPlayoffs } from "@/app/leagues/[slug]/standings/actions";

type SeedTeam = {
    id: number;
    name: string;
    wins: number;
    losses: number;
};

type StartPlayoffsButtonProps = {
    leagueId: number;
    seasonId: number;
    teamCount: number;
    teams: SeedTeam[];
};

export default function StartPlayoffsButton({
    leagueId,
    seasonId,
    teamCount,
    teams,
}: StartPlayoffsButtonProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    
    const [isOpen, setIsOpen] = useState(false);
    const [orderedTeams, setOrderedTeams] = useState<SeedTeam[]>(teams);

    function moveTeam(index: number, direction: -1 | 1) {
        const newIndex = index + direction;

        if (newIndex < 0 || newIndex >= orderedTeams.length) {
            return;
        }

        setOrderedTeams((current) => {
            const updated = [...current];

            [updated[index], updated[newIndex]] = [
                updated[newIndex],
                updated[index],
            ];

            return updated;
        });
    }

    function handleClose() {
        setIsOpen(false);
        setOrderedTeams(teams);
    }

    function handleStartPlayoffs() {
        setError(null);

        const orderedTeamIds = orderedTeams.map(
            (team) => team.id
        );

        startTransition(async () => {
            try {
                const result = await startPlayoffs(
                    leagueId,
                    seasonId,
                    orderedTeamIds
                );

                if (!result.success) {
                    setError(result.error ?? "Unable to start playoffs.");
                    return;
                }

                setIsOpen(false);
                router.refresh();
            } catch (error) {
                console.error("Failed to start playoffs:", error);
                setError("An unexpected error occurred.");
            }
        });
    }
    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="btn-primary"
            >
                Start Playoffs
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="start-playoffs-title"
                        className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-xl border border-[var(--surface-alt)] bg-[var(--surface)] shadow-xl"
                    >
                        <div className="border-b border-[var(--surface-alt)] p-6">
                            <h2
                                id="start-playoffs-title"
                                className="text-xl font-semibold text-[var(--text)]"
                            >
                                Set Playoff Seeding
                            </h2>

                            <p className="mt-2 text-sm text-[var(--text-muted)]">
                                Review the final standings and adjust the
                                order if necessary. The top {teamCount} teams
                                will qualify for the playoffs.
                            </p>
                        </div>

                        <div className="overflow-y-auto p-6">
                            <div className="space-y-2">
                                {orderedTeams.map((team, index) => {
                                    const qualifies = index < teamCount;

                                    return (
                                        <div key={team.id}>
                                            {index === teamCount && (
                                                <div className="my-4 border-t border-dashed border-[var(--border)] pt-3 text-center text-xs uppercase tracking-wide text-[var(--text-muted)]">
                                                    Playoff Cutoff
                                                </div>
                                            )}

                                            <div
                                                className={`flex items-center gap-3 rounded-lg border p-3 ${
                                                    qualifies
                                                        ? "border-[var(--accent)]/30 bg-[var(--surface-alt)]"
                                                        : "border-[var(--border)]"
                                                }`}
                                            >
                                                <span className="w-6 text-center font-mono text-sm font-semibold text-[var(--text-muted)]">
                                                    {index + 1}
                                                </span>

                                                <div className="min-w-0 flex-1">
                                                    <div className="truncate text-sm font-semibold text-[var(--text)]">
                                                        {team.name}
                                                    </div>

                                                    <div className="text-xs text-[var(--text-muted)]">
                                                        {team.wins}W – {team.losses}L
                                                    </div>
                                                </div>

                                                <div className="flex gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            moveTeam(index, -1)
                                                        }
                                                        disabled={index === 0}
                                                        aria-label={`Move ${team.name} up`}
                                                        className="rounded p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface)] disabled:opacity-25"
                                                    >
                                                        &uarr;
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            moveTeam(index, 1)
                                                        }
                                                        disabled={
                                                            index ===
                                                            orderedTeams.length - 1
                                                        }
                                                        aria-label={`Move ${team.name} down`}
                                                        className="rounded p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface)] disabled:opacity-25"
                                                    >
                                                        &darr;
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {error && (
                            <div
                                role="alert"
                                className="mx-6 mb-4 p-3 text-sm text-[var(--danger)]"
                            >
                                {error}
                            </div>
                        )}

                        <div className="flex justify-end gap-3 border-t border-[var(--surface-alt)] p-6">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="btn-tertiary"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleStartPlayoffs}
                                disabled={isPending}
                                className="btn-primary"
                            >
                                Confirm & Start
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}