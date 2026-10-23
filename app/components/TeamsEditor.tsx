"use client";

import { useActionState, useState } from "react";
import { createTeam, removeTeamFromSeason, updateTeam } from "@/app/leagues/[slug]/settings/actions";

type TeamsEditorProps = {
	leagueId: number;
    seasonId: number;
    teams: {
        id: number;
        name: string;
        venueId: number;
    }[]
    venues: {
        id: number;
        name: string;
    }[]
};

export default function TeamsEditor({
	leagueId,
	seasonId,
	teams,
    venues,
}: TeamsEditorProps) {
    const [editingTeam, setEditingTeam] = useState<Team | null>(null);

    const [teamName, setTeamName] = useState("");
    const [venueId, setVenueId] = useState<number>(0);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [isAddingTeam, setIsAddingTeam] = useState(false);
    const [newTeamName, setNewTeamName] = useState("");
    const [newTeamVenueId, setNewTeamVenueId] = useState<number>(
        venues[0]?.id ?? 0
    );
    const [isCreating, setIsCreating] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);

    const [deletingTeam, setDeletingTeam] = useState<Team | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    async function handleSaveTeam() {
        if (!editingTeam) {
            return;
        }

        setIsSaving(true);
        setError(null);

        try {
            const result = await updateTeam(
                editingTeam.id,
                teamName,
                venueId,
                leagueId
            );

            if (!result.success) {
                setError(result.error ?? "Unable to update team.");
                return;
            }

            setEditingTeam(null);
        } finally {
            setIsSaving(false);
        }
    }

    async function handleCreateTeam() {
        setIsCreating(true);
        setCreateError(null);

        try {
            const result = await createTeam(
                newTeamName,
                newTeamVenueId,
                leagueId,
                seasonId
            );

            if (!result.success) {
                setCreateError(
                    result.error ?? "Unable to create team."
                );
                return;
            }

            setIsAddingTeam(false);
            setNewTeamName("");
        } finally {
            setIsCreating(false);
        }
    }

    async function handleDeleteTeam() {
        if (!deletingTeam) {
            return;
        }

        setIsDeleting(true);
        setDeleteError(null);

        try {
            const result = await removeTeamFromSeason(
                deletingTeam.id,
                seasonId,
                leagueId
            );

            if (!result.success) {
                setDeleteError(
                    result.error ?? "Unable to remove team."
                );
                return;
            }

            setDeletingTeam(null);
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <>
            <h3 className="font-[family-name:var(--font-serif)] text-lg text-[var(--accent)] font-semibold">
                Teams
            </h3>
            <div>
                {teams.map((team) => {
                    const venue = venues.find(
						(venue) => venue.id === team.venueId
					);
                    return (
                        <div 
                            key={team.id}
                            className="flex gap-2 lg:gap-4 py-4 lg:py-0 lg:items-center py-1 text-sm border-b-1 border-[var(--surface-alt)] flex-col lg:flex-row"
                        >
                            <div className="min-w-0 flex-1 font-semibold">
                                {team.name}
                            </div>
                            <div className="lg:w-40 shrink-0 text-[var(--text-muted)]">
                                {venue.name}
                            </div>
                            <div className="flex shrink-0 gap-2">
                                <button 
                                    type="button"
                                    className="btn-primary text-xs"
                                    onClick={() => {
                                        setEditingTeam(team);
                                        setTeamName(team.name);
                                        setVenueId(team.venueId);
                                        setError(null);
                                    }}
                                >
                                    Edit
                                </button>
                                <button 
                                    type="button"
                                    className="btn-danger-subtle text-xs"
                                    onClick={() => {
                                        setDeletingTeam(team);
                                        setDeleteError(null);
                                    }}
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="flex justify-end mt-4">
                <button 
                    type="button"
                    className="btn-primary"
                    onClick={() => {
                        setNewTeamName("");
                        setNewTeamVenueId(venues[0]?.id ?? 0);
                        setCreateError(null);
                        setIsAddingTeam(true);
                    }}
                >
                    Add Team
                </button>
            </div>

            {/* EDIT TEAM */}
            {editingTeam && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                    <div className="w-full max-w-md rounded-xl bg-[var(--background)] p-6 shadow-xl">
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold">
                                Edit Team
                            </h2>

                            <p className="mt-1 text-sm opacity-70">
                                Update the team information.
                            </p>
                        </div>

                        <div>
                            <label
                                htmlFor="team-name"
                                className="mb-2 block text-sm font-semibold"
                            >
                                Team Name
                            </label>

                            <input
                                id="team-name"
                                type="text"
                            	value={teamName}
	                            onChange={(e) => setTeamName(e.target.value)}
                                className="form-input"
                            />
                        </div>

                        <div className="mt-4">
                            <label
                                htmlFor="team-venue"
                                className="mb-2 block text-sm font-semibold"
                            >
                                Venue
                            </label>

                            <select
                                id="team-venue"
                                value={venueId}
	                            onChange={(e) => setVenueId(Number(e.target.value))}
                                className="form-input"
                            >
                                {venues.map((venue) => (
                                    <option
                                        key={venue.id}
                                        value={venue.id}
                                    >
                                        {venue.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            {error && (
                                <p className="mt-4 text-sm text-red-500">
                                    {error}
                                </p>
                            )}
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={() => setEditingTeam(null)}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="btn-primary"
                                onClick={handleSaveTeam}
                            	disabled={isSaving}
                            >
                                {isSaving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isAddingTeam && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                    <div className="w-full max-w-md rounded-xl bg-[var(--background)] p-6 shadow-xl">
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold">
                                Add Team
                            </h2>

                            <p className="mt-1 text-sm opacity-70">
                                Add a team to this season.
                            </p>
                        </div>

                        <div>
                            <label
                                htmlFor="new-team-name"
                                className="mb-2 block text-sm font-semibold"
                            >
                                Team Name
                            </label>

                            <input
                                id="new-team-name"
                                type="text"
                                value={newTeamName}
                                onChange={(e) => setNewTeamName(e.target.value)}
                                className="form-input"
                                autoFocus
                            />
                        </div>

                        <div className="mt-4">
                            <label
                                htmlFor="new-team-venue"
                                className="mb-2 block text-sm font-semibold"
                            >
                                Venue
                            </label>

                            <select
                                id="new-team-venue"
                                value={newTeamVenueId}
                                onChange={(e) =>
                                    setNewTeamVenueId(Number(e.target.value))
                                }
                                className="form-input"
                            >
                                {venues.map((venue) => (
                                    <option
                                        key={venue.id}
                                        value={venue.id}
                                    >
                                        {venue.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {createError && (
                            <p className="mt-4 text-sm text-red-500">
                                {createError}
                            </p>
                        )}

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={() => setIsAddingTeam(false)}
                                disabled={isCreating}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="btn-primary"
                                onClick={handleCreateTeam}
                                disabled={isCreating || !newTeamVenueId}
                            >
                                {isCreating ? "Adding..." : "Add Team"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* REMOVE TEAM */}
            {deletingTeam && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                    <div className="w-full max-w-md rounded-xl bg-[var(--background)] p-6 shadow-xl">
                        <h2 className="text-xl font-semibold">
                            Remove Team
                        </h2>

                        <p className="mt-2 opacity-70">
                            Are you sure you want to remove{" "}
                            <strong>{deletingTeam.name}</strong> from this season?
                        </p>

                        <p className="mt-4 text-sm opacity-70">
                            The team itself will not be deleted.
                        </p>

                        {deleteError && (
                            <p className="mt-4 text-sm text-red-500">
                                {deleteError}
                            </p>
                        )}

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={() => setDeletingTeam(null)}
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="btn-danger-subtle"
                                onClick={handleDeleteTeam}
                                disabled={isDeleting}
                            >
                                {isDeleting ? "Removing..." : "Remove Team"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}   