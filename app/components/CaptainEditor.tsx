"use client";

import { useState } from "react";
import { saveTeamCaptains } from "@/app/leagues/[slug]/teams/[team-slug]/actions";

type RosterPlayer = {
    id: number;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
};

type CaptainEditorProps = {
    players: RosterPlayer[];
    captainId: number | null;
    coCaptainId: number | null;
    leagueId: number;
    seasonId: number;
    teamId: number;
};

export default function CaptainEditor({
    players,
    captainId,
    coCaptainId,
    leagueId,
    seasonId,
    teamId,
}: CaptainEditorProps) {
    const [selectedCaptain, setSelectedCaptain] = useState(
        captainId?.toString() ?? ""
    );

    const [selectedCoCaptain, setSelectedCoCaptain] = useState(
        coCaptainId?.toString() ?? ""
    );

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSave() {
        setSaving(true);
        setError(null);

        try {
            const result = await saveTeamCaptains(
                leagueId,
                seasonId,
                teamId,
                selectedCaptain ? Number(selectedCaptain) : null,
                selectedCoCaptain ? Number(selectedCoCaptain) : null
            );

            if (!result.success) {
                setError(result.error ?? "Unable to save captains.");
            }
        } catch {
            setError("Something went wrong while saving captains.");
        } finally {
            setSaving(false);
        }
    }


    return (
        <div className="space-y-4 p-4 border-t border-[var(--surface-alt)]">
            <div>
                <label className="mb-2 block text-sm font-semibold">
                    Captain
                </label>

                <select
                    value={selectedCaptain}
                    onChange={(e) => setSelectedCaptain(e.target.value)}
                    className="w-full rounded-md border border-[var(--surface-alt)] bg-[var(--surface)] px-3 py-2"
                >
                    <option value="">Select Captain</option>

                    {players.map((player) => (
                        <option
                            key={player.id}
                            value={player.id}
                            disabled={
                                selectedCoCaptain === String(player.id) ||
                                (!player.email?.trim() && !player.phone?.trim())
                            }
                        >
                            {player.firstName} {player.lastName}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="mb-2 block text-sm font-semibold">
                    Co-Captain
                </label>

                <select
                    value={selectedCoCaptain}
                    onChange={(e) => setSelectedCoCaptain(e.target.value)}
                    className="w-full rounded-md border border-[var(--surface-alt)] bg-[var(--surface)] px-3 py-2"
                >
                    <option value="">Select Co-Captain</option>

                    {players.map((player) => (
                        <option
                            key={player.id}
                            value={player.id}
                            disabled={
                                selectedCaptain === String(player.id) ||
                                (!player.email?.trim() && !player.phone?.trim())
                            }
                        >
                            {player.firstName} {player.lastName}
                        </option>
                    ))}
                </select>
            </div>
            {error && (
                <p className="text-sm text-red-500">
                    {error}
                </p>
            )}

            <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="btn-primary disabled:opacity-50"
            >
                {saving ? "Saving..." : "Save Captains"}
            </button>
        </div>
    );
}