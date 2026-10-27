"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSeason } from "@/app/leagues/[slug]/settings/actions";
import { createPortal } from "react-dom";

type SeasonOption = {
    id: number;
    name: string;
};

type Props = {
    leagueId: number;
    seasons: SeasonOption[];
    activeSeasonId: number | null;
};

export default function CreateSeasonForm({
    leagueId,
    seasons,
    activeSeasonId,
}: Props) {
    const [isCreatingSeason, setIsCreatingSeason] = useState(false);

    const router = useRouter();

    const [name, setName] = useState("");
    const [sourceSeasonId, setSourceSeasonId] = useState<number | null>(
        activeSeasonId
    );

    const [carryOver, setCarryOver] = useState({
        teams: true,
        rosters: true,
        rules: true,
        playoffs: true,
    });

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (saving) {
            return;
        }

        setSaving(true);
        setError("");

        try {
            const result = await createSeason(leagueId, {
                name,
                sourceSeasonId,
                carryOver: sourceSeasonId === null
                    ? {
                        teams: false,
                        rosters: false,
                        rules: false,
                        playoffs: false,
                    }
                    : carryOver,
            });

            if (!result.success) {
                setError(result.error ?? "Unable to create season.");
                return;
            }

            setIsCreatingSeason(false);
            setName("");
            router.refresh();
        } catch (error) {
            console.error("Failed to create season:", error);
            setError("Something went wrong while creating the season.");
        } finally {
            setSaving(false);
        }
    }

    function updateCarryOver(
        key: keyof typeof carryOver,
        checked: boolean
    ) {
        setCarryOver((current) => ({
            ...current,
            [key]: checked,
            ...(key === "teams" && !checked
                ? { rosters: false }
                : {}),
        }));
    }

    return (
        <>
            <div className="flex justify-end mt-4">
                <button
                    type="button"
                    className="btn-primary"
                    onClick={() => {
                        setError("");
                        setIsCreatingSeason(true);
                    }}
                >
                    Create New Season
                </button>
            </div>

            {isCreatingSeason && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                    <div className="w-full max-w-md rounded-xl bg-[var(--background)] p-6 shadow-xl">
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold">
                                Create New Season
                            </h2>

                            <p className="mt-1 text-sm opacity-70">
                                Create a season and optionally carry over settings
                                from an existing season.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label
                                    htmlFor="season-name"
                                    className="mb-2 block text-sm font-semibold"
                                >
                                    Season Name
                                </label>

                                <input
                                    id="season-name"
                                    type="text"
                                    className="form-input"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="2027-2028"
                                    maxLength={100}
                                    required
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="source-season"
                                    className="mb-2 block text-sm font-semibold"
                                >
                                    Copy Settings From
                                </label>

                                <select
                                    id="source-season"
                                    className="form-input"
                                    value={sourceSeasonId ?? ""}
                                    onChange={(e) =>
                                        setSourceSeasonId(
                                            e.target.value ? Number(e.target.value) : null
                                        )
                                    }
                                >
                                    <option value="">Start from scratch</option>

                                    {seasons.map((season) => (
                                        <option key={season.id} value={season.id}>
                                            {season.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {sourceSeasonId !== null && (
                                <fieldset className="space-y-3">
                                    <legend className="mb-3 text-sm font-semibold">
                                        Carry Over&nbsp;
                                        <span className="text-[var(--text-muted)]">
                                            (You can edit these later.)
                                        </span>
                                    </legend>

                                    {([
                                        ["teams", "Teams"],
                                        ["rosters", "Rosters and captains"],
                                        ["rules", "Rules and match format"],
                                        ["playoffs", "Playoff configuration"],
                                    ] as const).map(([key, label]) => (
                                        <label
                                            key={key}
                                            className="flex items-center gap-3 text-sm"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={carryOver[key]}
                                                disabled={
                                                    saving ||
                                                    (key === "rosters" && !carryOver.teams)
                                                }
                                                onChange={(e) =>
                                                    updateCarryOver(key, e.target.checked)
                                                }
                                                className="accent-[var(--accent)]"
                                            />

                                            {label}
                                        </label>
                                    ))}
                                </fieldset>
                            )}

                            {error && (
                                <p className="text-sm text-[var(--danger)]">
                                    {error}
                                </p>
                            )}

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => setIsCreatingSeason(false)}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={saving || !name.trim()}
                                >
                                    {saving ? "Creating..." : "Create Season"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.getElementById("season-modal-root")!
            )}
        </>
    );
}