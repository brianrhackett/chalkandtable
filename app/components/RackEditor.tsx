"use client";

import { useState, useTransition } from "react";
import { saveRackResults } from "@/app/leagues/[slug]/matches/[matchId]/actions"

type Team = {
    id: number;
    name: string;
};

type RackResult = {
    rackNumber: number;
    winnerTeamId: number | null;
};

type RackEditorProps = {
    leagueId: number;
    matchId: number;
    awayTeam: Team;
    homeTeam: Team;
    existingRacks: RackResult[];
    canEditRacks: boolean;
};

export default function RackEditor({
    leagueId,
    matchId,
    awayTeam,
    homeTeam,
    existingRacks,
    canEditRacks,
}: RackEditorProps) {
    
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState<string | null>(null);

    const [racks, setRacks] = useState<RackResult[]>(
        existingRacks.length > 0
            ? existingRacks
            : [
                {
                    rackNumber: 1,
                    winnerTeamId: null,
                },
            ]
    );

    function addRack() {
        setRacks([
            ...racks,
            {
                rackNumber: racks.length + 1,
                winnerTeamId: null,
            },
        ]);
    }

    function removeRack() {
        if (racks.length <= 1) {
            return;
        }

        setRacks(racks.slice(0, -1));
    }

    function selectWinner(
        rackNumber: number,
        teamId: number
    ) {
        setRacks(
            racks.map((rack) =>
                rack.rackNumber === rackNumber
                    ? {
                        ...rack,
                        winnerTeamId:
                            rack.winnerTeamId === teamId
                                ? null
                                : teamId,
                    }
                    : rack
            )
        );
    }

    function saveRacks() {
        const completedRacks = racks.filter(
            (rack): rack is RackResult & { winnerTeamId: number } =>
                rack.winnerTeamId !== null
        );

        if (completedRacks.length !== racks.length) {
            setMessage("Select a winner for every rack.");
            return;
        }

        setMessage(null);

        startTransition(async () => {
            const result = await saveRackResults(
                leagueId,
                matchId,
                completedRacks
            );

            if (!result.success) {
                setMessage(
                    result.error ?? "Unable to save rack results."
                );
                return;
            }

            setMessage("Rack results saved.");
        });
    }

    return (
        <div className="p-6 mt-2">
            <div className="space-y-2">
                {racks.map((rack) => (
                    <div
                        key={rack.rackNumber}
                        className="grid grid-cols-3 sm:grid-cols-[80px_1fr_1fr_80px] items-center gap-3"
                    >
                        <div className="font-sans text-sm font-semibold text-[var(--text-muted)]">
                            Rack {rack.rackNumber}
                        </div>

                        <button
                            type="button"
                            disabled={!canEditRacks || isPending}
                            onClick={() =>
                                selectWinner(
                                    rack.rackNumber,
                                    awayTeam.id
                                )
                            }
                            className={`h-9 rounded-lg border font-sans text-sm font-semibold transition ${
                                rack.winnerTeamId === awayTeam.id
                                    ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                                    : "border-[var(--surface-alt)] bg-[var(--surface)] hover:border-[var(--accent)]"
                            }`}
                        >
                            {awayTeam.name}
                        </button>

                        <button
                            type="button"
                            disabled={!canEditRacks || isPending}
                            onClick={() =>
                                selectWinner(
                                    rack.rackNumber,
                                    homeTeam.id
                                )
                            }
                            className={`h-9 rounded-lg border font-sans text-sm font-semibold transition ${
                                rack.winnerTeamId === homeTeam.id
                                    ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                                    : "border-[var(--surface-alt)] bg-[var(--surface)] hover:border-[var(--accent)]"
                            }`}
                        >
                            {homeTeam.name}
                        </button>
                    </div>
                ))}
            </div>


            {canEditRacks && (
                <>
                    <div className="mt-4 flex items-center justify-center gap-4">
                        <button
                            type="button"
                            onClick={addRack}
                            className="font-sans text-sm font-semibold text-[var(--accent)] hover:underline"
                        >
                            + Add Rack
                        </button>

                        {racks.length > 1 && (
                            <button
                                type="button"
                                onClick={removeRack}
                                className="font-sans text-sm font-semibold text-[var(--text-muted)] hover:underline"
                            >
                                Remove Rack
                            </button>
                        )}
                    </div>

                    <div className="mt-6 text-center">
                        <button
                            type="button"
                            onClick={saveRacks}
                            disabled={isPending}
                            className="rounded-lg bg-[var(--accent)] px-5 py-2 font-sans text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isPending ? "Saving..." : "Save Results"}
                        </button>

                        {message && (
                            <p className="mt-2 font-sans text-sm text-[var(--text-muted)]">
                                {message}
                            </p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}