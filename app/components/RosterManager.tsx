"use client";

import { useState, useTransition } from "react";

import { createRosterPlayer, addExistingRosterPlayer } from "@/app/leagues/[slug]/teams/[team-slug]/actions";

import { UserSearch, UserPlus, X } from "lucide-react";

type Props = {
    leagueId: number;
    seasonId: number;
    teamId: number;
    availablePlayers: {
        id: number;
        firstName: string;
        lastName: string;
    }[];
};

export default function RosterManager({
    leagueId,
    seasonId,
    teamId,
    availablePlayers,
}: Props) {
    const [showExistingPlayerModal, setShowExistingPlayerModal] =
        useState(false);

    const [showCreatePlayerModal, setShowCreatePlayerModal] =
        useState(false);

    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(
        null
    );

    function handleCreatePlayer(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        const form = event.currentTarget;
        const formData = new FormData(form);

        setError(null);

        startTransition(async () => {
            const result = await createRosterPlayer(
                leagueId,
                seasonId,
                teamId,
                String(formData.get("firstName") ?? ""),
                String(formData.get("lastName") ?? ""),
                String(formData.get("email") ?? ""),
                String(formData.get("phone") ?? "")
            );

            if (!result.success) {
                setError(result.error ?? "Unable to create player.");
                return;
            }

            form.reset();
            setShowCreatePlayerModal(false);
        });
    }

    function handleAddExistingPlayer() {
        if (!selectedPlayerId) {
            setError("Select a player.");
            return;
        }

        setError(null);

        startTransition(async () => {
            const result = await addExistingRosterPlayer(
                leagueId,
                seasonId,
                teamId,
                selectedPlayerId
            );

            if (!result.success) {
                setError(result.error ?? "Unable to add player.");
                return;
            }

            setSelectedPlayerId(null);
            setShowExistingPlayerModal(false);
        });
    }

    return (
        <div className="flex gap-3 p-4 border-t border-[var(--surface-alt)]">
            {(availablePlayers.length > 0) &&
                <button
                    type="button"
                    onClick={() => {
                        setError(null);
                        setShowExistingPlayerModal(true);
                    }}
                    disabled={availablePlayers.length === 0}
                    className="btn-primary flex items-center gap-2"
                >
                    <UserSearch
                        className="inline size-4"
                    /> Add Existing Player
                </button>
            }
            <button
                type="button"
                onClick={() => {
                    setError(null);
                    setShowCreatePlayerModal(true);
                }}
                className="btn-primary flex items-center gap-2"
            >
                <UserPlus
                    className="inline size-4"
                /> Create Player
            </button>

            {showExistingPlayerModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-lg rounded-xl border border-[var(--surface-alt)] bg-[var(--surface)] p-6 shadow-xl">
                        <div className="mb-6 flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-semibold">
                                    Add Existing Player
                                </h2>

                                <p className="mt-1 text-sm text-[var(--text-muted)]">
                                    Add an existing league player to this team's roster.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedPlayerId(null);
                                    setShowExistingPlayerModal(false);
                                }}
                                className="text-[var(--text-muted)] hover:text-current"
                                aria-label="Close"
                            >
                                <X />
                            </button>
                        </div>

                        <div>
                            <label
                                htmlFor="existingPlayer"
                                className="mb-1.5 block text-sm font-medium"
                            >
                                Player
                            </label>

                            <select
                                id="existingPlayer"
                                value={selectedPlayerId ?? ""}
                                onChange={(event) =>
                                    setSelectedPlayerId(
                                        event.target.value
                                            ? Number(event.target.value)
                                            : null
                                    )
                                }
                                className="w-full rounded-md border border-[var(--surface-alt)] bg-[var(--surface-alt)] px-3 py-2 outline-none focus:border-[var(--accent)]"
                            >
                                <option value="">Select a player...</option>

                                {availablePlayers.map((player) => (
                                    <option
                                        key={player.id}
                                        value={player.id}
                                    >
                                        {player.firstName} {player.lastName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {error && (
                            <p className="mt-4 text-sm text-red-600">
                                {error}
                            </p>
                        )}

                        <div className="mt-6 flex justify-end gap-3 border-t border-[var(--surface-alt)] pt-5">
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedPlayerId(null);
                                    setShowExistingPlayerModal(false);
                                }}
                                className="btn-tertiary"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleAddExistingPlayer}
                                disabled={isPending || !selectedPlayerId}
                                className="btn-primary"
                            >
                                {isPending ? "Adding..." : "Add Player"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showCreatePlayerModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-lg rounded-xl border border-[var(--surface-alt)] bg-[var(--surface)] p-6 shadow-xl">
                        <div className="mb-6 flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-semibold">
                                    Create Player
                                </h2>

                                <p className="mt-1 text-sm text-[var(--text-muted)]">
                                    Add a new player to this team's roster.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowCreatePlayerModal(false)}
                                className="text-[var(--text-muted)] hover:text-current"
                                aria-label="Close"
                            >
                                <X />
                            </button>
                        </div>

                        <form 
                            onSubmit={handleCreatePlayer}
                            className="space-y-5"
                        >
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label
                                        htmlFor="firstName"
                                        className="mb-1.5 block text-sm font-medium"
                                    >
                                        First Name
                                    </label>

                                    <input
                                        id="firstName"
                                        name="firstName"
                                        type="text"
                                        required
                                        className="form-input"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="lastName"
                                        className="mb-1.5 block text-sm font-medium"
                                    >
                                        Last Name
                                    </label>

                                    <input
                                        id="lastName"
                                        name="lastName"
                                        type="text"
                                        required
                                        className="form-input"
                                    />
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-1.5 block text-sm font-medium"
                                >
                                    Email
                                </label>

                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    className="form-input"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="phone"
                                    className="mb-1.5 block text-sm font-medium"
                                >
                                    Phone
                                </label>

                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    className="form-input"
                                />
                            </div>

                            {error && (
                                <p className="text-sm text-[var(--danger)]">
                                    {error}
                                </p>
                            )}

                            <div className="flex justify-end gap-3 border-t border-[var(--surface-alt)] pt-5">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowCreatePlayerModal(false)
                                    }
                                    className="btn-tertiary"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="btn-primary"
                                >
                                    Create Player
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}