"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { activateSeason } from "@/app/leagues/[slug]/settings/actions";

type Season = {
    id: number;
    name: string;
    active: boolean;
};

type SeasonsEditorProps = {
    leagueId: number;
    seasons: Season[];
};

export default function SeasonsEditor({
    leagueId,
    seasons,
}: SeasonsEditorProps) {
    const router = useRouter();

    const [activatingSeason, setActivatingSeason] =
        useState<Season | null>(null);

    const [isActivating, setIsActivating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleActivateSeason() {
        if (!activatingSeason) {
            return;
        }

        setIsActivating(true);
        setError(null);

        try {
            const result = await activateSeason(
                leagueId,
                activatingSeason.id
            );

            if (!result.success) {
                setError(
                    result.error ?? "Unable to activate season."
                );
                return;
            }

            setActivatingSeason(null);
            router.refresh();
        } catch {
            setError("Something went wrong while activating the season.");
        } finally {
            setIsActivating(false);
        }
    }

    return (
        <>
            <div>
                {seasons.map((season) => (
                    <div
                        key={season.id}
                        className="flex flex-col gap-3 border-b border-[var(--surface-alt)] py-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                        <div className="font-semibold">
                            {season.name}
                        </div>

                        <div className="flex items-center gap-3">
                            {season.active ? (
                                <span className="text-sm font-semibold text-[var(--accent)]">
                                    Active Season
                                </span>
                            ) : (
                                <button
                                    type="button"
                                    className="btn-secondary text-xs"
                                    onClick={() => {
                                        setActivatingSeason(season);
                                        setError(null);
                                    }}
                                >
                                    Activate Season
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {activatingSeason && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                    <div className="w-full max-w-md rounded-xl bg-[var(--background)] p-6 shadow-xl">
                        <h2 className="text-xl font-semibold">
                            Activate Season
                        </h2>

                        <p className="mt-4 text-sm text-[var(--text-muted)]">
                            Are you sure you want to make{" "}
                            <strong className="text-[var(--text)]">
                                {activatingSeason.name}
                            </strong>{" "}
                            the active season?
                        </p>

                        <p className="mt-3 text-sm text-[var(--text-muted)]">
                            The current season will become inactive.
                            Previous seasons and their results will
                            remain available.
                        </p>

                        {error && (
                            <p className="mt-4 text-sm text-red-500">
                                {error}
                            </p>
                        )}

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={() => setActivatingSeason(null)}
                                disabled={isActivating}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="btn-primary"
                                onClick={handleActivateSeason}
                                disabled={isActivating}
                            >
                                {isActivating
                                    ? "Activating..."
                                    : "Activate Season"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}