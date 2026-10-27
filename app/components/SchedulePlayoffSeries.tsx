"use client";

import { useState, useTransition } from "react";
import type { SeasonPlayoffSeries } from "@/lib/leagues/getSeasonPlayoffs";

import { useRouter } from "next/navigation";
import {
    savePlayoffSchedule,
    type PlayoffScheduleGameInput,
} from "@/app/leagues/[slug]/standings/actions";

import { X } from "lucide-react";
import { Temporal } from "@js-temporal/polyfill";

type Props = {
    leagueId: number;
    series: SeasonPlayoffSeries;
};

type ScheduledGame = {
    id: number | null;
    seriesMatch: number;
    date: string;
    time: string;
    homeTeamId: number;
};

export default function SchedulePlayoffSeries({ 
    leagueId,
    series 
}: Props) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const buildGames = (): ScheduledGame[] =>
        Array.from({ length: series.bestOf }, (_, index) => {
            const existing = series.matches.find(
                (match) => match.seriesMatch === index + 1
            );

            const scheduledAt = existing
                ? new Date(existing.scheduledAt)
                : null;

            return {
                id: existing?.id ?? null,
                seriesMatch: index + 1,
                date: scheduledAt
                    ? scheduledAt.toISOString().slice(0, 10)
                    : "",
                time: scheduledAt
                    ? scheduledAt.toISOString().slice(11, 16)
                    : "19:00",
                homeTeamId:
                    existing?.homeTeamId ??
                    (index % 2 === 0
                        ? series.higherSeed.teamId
                        : series.lowerSeed.teamId),
            };
        });

    const [games, setGames] = useState<ScheduledGame[]>(buildGames);

    const updateGame = (
        index: number,
        changes: Partial<ScheduledGame>
    ) => {
        setGames((current) =>
            current.map((game, i) =>
                i === index ? { ...game, ...changes } : game
            )
        );
    };

    const handleSave = () => {
        setError(null);

        if (games.some((game) => !game.date || !game.time)) {
            setError("Every game needs a date and time.");
            return;
        }

        const schedule: PlayoffScheduleGameInput[] = games.map((game) => ({
            id: game.id,
            seriesMatch: game.seriesMatch,
            scheduledAt: Temporal.PlainDateTime
                .from(`${game.date}T${game.time}`)
                .toZonedDateTime("America/New_York")
                .toInstant()
                .toString(),
            homeTeamId: game.homeTeamId,
        }));

        startTransition(async () => {
            try {
                const result = await savePlayoffSchedule(
                    leagueId,
                    series.id,
                    schedule
                );

                if (!result.success) {
                    setError(result.error ?? "Unable to save schedule.");
                    return;
                }

                setIsOpen(false);
                router.refresh();
            } catch (error) {
                console.error(error);
                setError("An unexpected error occurred.");
            }
        });
    };

    return (
        <>
            <button
                type="button"
                onClick={() => {
                    setGames(buildGames());
                    setError(null);
                    setIsOpen(true);
                }}
                className="text-sm font-semibold text-[var(--accent)] hover:underline"
            >
                {series.matches.length > 0
                    ? "Edit Schedule"
                    : "Schedule Matches"}
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                    <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-lg bg-[var(--surface)] p-6 shadow-xl">
                        <div className="mb-5 flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-bold">
                                    Schedule Series {series.seriesNumber}
                                </h2>
                                <p className="mt-1 text-sm text-[var(--text-muted)]">
                                    {series.higherSeed.name} vs.{" "}
                                    {series.lowerSeed.name} · Best of{" "}
                                    {series.bestOf}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="text-[var(--text-muted)] hover:text-[var(--text)]"
                            >
                                <X />
                            </button>
                        </div>

                        <div className="space-y-5">
                            {games.map((game, index) => {
                                const existing = series.matches.find(
                                    (match) =>
                                        match.seriesMatch === game.seriesMatch
                                );

                                const locked =
                                    existing?.status === "completed" ||
                                    existing?.status === "cancelled";

                                return (
                                    <div
                                        key={game.seriesMatch}
                                        className="border-b border-[var(--surface-alt)] pb-5 last:border-0"
                                    >
                                        <div className="mb-3 flex items-center justify-between">
                                            <h3 className="font-semibold">
                                                Game {game.seriesMatch}
                                            </h3>

                                            {locked && (
                                                <span className="text-xs text-[var(--text-muted)]">
                                                    {existing?.status}
                                                </span>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <label className="text-sm">
                                                <span className="mb-1 block text-[var(--text-muted)]">
                                                    Date
                                                </span>
                                                <input
                                                    type="date"
                                                    value={game.date}
                                                    disabled={locked}
                                                    onChange={(event) =>
                                                        updateGame(index, {
                                                            date: event.target.value,
                                                        })
                                                    }
                                                    className="w-full rounded border border-[var(--surface-alt)] bg-[var(--surface)] px-3 py-2"
                                                />
                                            </label>

                                            <label className="text-sm">
                                                <span className="mb-1 block text-[var(--text-muted)]">
                                                    Time
                                                </span>
                                                <input
                                                    type="time"
                                                    value={game.time}
                                                    disabled={locked}
                                                    onChange={(event) =>
                                                        updateGame(index, {
                                                            time: event.target.value,
                                                        })
                                                    }
                                                    className="w-full rounded border border-[var(--surface-alt)] bg-[var(--surface)] px-3 py-2"
                                                />
                                            </label>
                                        </div>

                                        <label className="mt-3 block text-sm">
                                            <span className="mb-1 block text-[var(--text-muted)]">
                                                Home Team
                                            </span>
                                            <select
                                                value={game.homeTeamId}
                                                disabled={locked}
                                                onChange={(event) =>
                                                    updateGame(index, {
                                                        homeTeamId: Number(
                                                            event.target.value
                                                        ),
                                                    })
                                                }
                                                className="w-full rounded border border-[var(--surface-alt)] bg-[var(--surface)] px-3 py-2"
                                            >
                                                <option value={series.higherSeed.teamId}>
                                                    {series.higherSeed.name}
                                                </option>
                                                <option value={series.lowerSeed.teamId}>
                                                    {series.lowerSeed.name}
                                                </option>
                                            </select>
                                        </label>
                                    </div>
                                );
                            })}
                        </div>

                        {error && (
                            <p className="mt-4 text-sm text-red-500">
                                {error}
                            </p>
                        )}

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                disabled={isPending}
                                className="btn-muted"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={isPending}
                                className="btn-primary"
                            >
                                Save Schedule
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}