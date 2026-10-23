"use client";

import Link from "next/link";

import { useState, useTransition } from "react";
import { saveMatchLineup } from "@/app/leagues/[slug]/matches/[matchId]/lineup/[teamId]/actions"

type RosterPlayer = {
    rosterPlayerId: number;
    playerId: number;
    name: string;
};

type MatchLineupPlayer = {
    id: number;
    matchId: number;
    teamId: number;
    rosterPlayerId: number;
    position: number;
};

type LineupEditorProps = {
    league: League;
    team: Team;
    match: Match;
    roster: RosterPlayer[];
    existingLineup: MatchLineupPlayer[];
    canEditLineup: boolean;
};

export default function LineupEditor({
    league,
    team,
    match,
    roster,
    existingLineup,
    canEditLineup,
}: LineupEditorProps) {
    const [lineup, setLineup] = useState<(number | null)[]>(
        existingLineup.length > 0
            ? existingLineup.map(
                (lineupPlayer) => lineupPlayer.rosterPlayerId
            )
            : [null]
    );

    const [error, setError] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);
    const [isPending, startTransition] = useTransition();

    function addPlayer() {
        if (lineup.length >= roster.length) {
            return;
        }

        setLineup([
            ...lineup,
            null,
        ]);
    }

    function removePlayer(index: number) {
        setLineup(
            lineup.filter((_, lineupIndex) => lineupIndex !== index)
        );
    }

    function selectPlayer(
        index: number,
        rosterPlayerId: number | null
    ) {
        setLineup(
            lineup.map((playerId, lineupIndex) =>
                lineupIndex === index
                    ? rosterPlayerId
                    : playerId
            )
        );
    }

    function handleSave() {
        setError(null);
        setSaved(false);

        const matchId = match.id;
        const teamId = team.id;

        const rosterPlayerIds = lineup.filter(
            (playerId): playerId is number => playerId !== null
        );

        if (rosterPlayerIds.length !== lineup.length) {
            setError("Select a player for every lineup position.");
            return;
        }

        startTransition(async () => {
            const result = await saveMatchLineup({
                matchId,
                teamId,
                rosterPlayerIds,
            });

            if (!result.success) {
                setError(result.error ?? "Unable to save lineup.");
                return;
            }

            setSaved(true);
        });
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h2 className="font-[family-name:var(--font-serif)] text-xl sm:text-2xl font-bold">
                    {team.name} Lineup
                </h2>

                <p className="mt-1 font-sans text-sm text-[var(--text-muted)]">
                    Set your lineup in the order players will play.
                </p>
            </div>
            
            <div>
                <div className="space-y-3">
                    {lineup.map((selectedPlayerId, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-3"
                        >
                            <div className="flex h-11 w-14 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-alt)] font-sans font-bold">
                                {index + 1}
                            </div>

                            <select
                                value={selectedPlayerId ?? ""}
                                disabled={!canEditLineup || isPending}
                                onChange={(event) =>
                                    selectPlayer(
                                        index,
                                        event.target.value
                                            ? Number(event.target.value)
                                            : null
                                    )
                                }
                                className="h-11 flex-1 rounded-lg border border-[var(--surface-alt)] bg-[var(--surface)] px-4 font-sans"
                            >
                                <option value="">
                                    Select player
                                </option>

                                {roster.map((player) => {
                                    const alreadySelected =
                                        lineup.includes(
                                            player.rosterPlayerId
                                        ) &&
                                        player.rosterPlayerId !==
                                            selectedPlayerId;

                                    return (
                                        <option
                                            key={player.rosterPlayerId}
                                            value={player.rosterPlayerId}
                                            disabled={alreadySelected}
                                        >
                                            {player.name}
                                        </option>
                                    );
                                })}
                            </select>

                            {canEditLineup && lineup.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removePlayer(index)}
                                    className="font-sans text-xs font-semibold text-red-600 hover:underline"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                
                {canEditLineup && (
                    <div className="mt-6">    
                        <button
                            type="button"
                            onClick={addPlayer}
                            disabled={lineup.length >= roster.length}
                            className="mt-4 font-sans text-sm font-semibold text-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            + Add Player
                        </button>
                    </div>
                )}
            </div>

            {error && (
                <p className="mt-4 font-sans text-sm font-medium text-red-600">
                    {error}
                </p>
            )}

            {saved && (
                <p className="mt-4 font-sans text-sm font-medium text-[var(--accent)]">
                    Lineup saved.
                </p>
            )}
            
            {canEditLineup && (
                <div className="mt-8 flex items-center gap-3">
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={isPending}
                        className="btn-primary"
                    >
                        {isPending ? "Saving..." : "Save Lineup"}
                    </button>

                    <Link
                        href={`/leagues/${league.slug}/schedule`}
                        className="btn-secondary"
                    >
                        Cancel
                    </Link>
                </div>
            )}
        </div>
    );
}