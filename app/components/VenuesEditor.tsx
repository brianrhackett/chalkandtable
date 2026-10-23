"use client";

import { useState } from "react";
import { createVenue, deleteVenue, updateVenue } from "@/app/leagues/[slug]/settings/actions";

type Venue = {
	id: number;
	name: string;
	teamCount: number;
};

type VenuesEditorProps = {
	leagueId: number;
    venues: {
        id: number;
        name: string;
        teamCount: number;
    }[]
};



export default function VenuesEditor({
	leagueId,
	venues,
}: VenuesEditorProps) {
    
    const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
    const [venueName, setVenueName] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [isAddingVenue, setIsAddingVenue] = useState(false);
    const [newVenueName, setNewVenueName] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);

    const [deletingVenue, setDeletingVenue] = useState<Venue | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    async function handleSaveVenue() {
        if (!editingVenue) {
            return;
        }

        setIsSaving(true);
        setError(null);

        try {
            const result = await updateVenue(
                editingVenue.id,
                venueName,
                leagueId
            );
            console.log("updateVenue result:", result);
            if (!result.success) {
                setError(result.error ?? "Unable to update venue.");
                return;
            }

            setEditingVenue(null);
        } finally {
            setIsSaving(false);
        }
    }

    async function handleCreateVenue() {
        setIsCreating(true);
        setCreateError(null);

        try {
            const result = await createVenue(
                newVenueName,
                leagueId
            );

            if (!result.success) {
                setCreateError(
                    result.error ?? "Unable to create venue."
                );
                return;
            }

            setIsAddingVenue(false);
            setNewVenueName("");
        } finally {
            setIsCreating(false);
        }
    }

    async function handleDeleteVenue() {
        if (!deletingVenue) {
            return;
        }

        setIsDeleting(true);
        setDeleteError(null);

        try {
            const result = await deleteVenue(
                deletingVenue.id,
                leagueId
            );

            if (!result.success) {
                setDeleteError(
                    result.error ?? "Unable to delete venue."
                );
                return;
            }

            setDeletingVenue(null);
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <>
            <h3 className="font-[family-name:var(--font-serif)] text-lg text-[var(--accent)] font-semibold">
                Venues
            </h3>
            <div>
                {venues.map((venue) => (
                    <div 
                        key={venue.id}
                        className="flex gap-2 lg:gap-4 py-4 lg:py-0 lg:items-center py-1 text-sm border-b-1 border-[var(--surface-alt)] flex-col lg:flex-row"
                    >
                        <div className="min-w-0 flex-1 font-semibold">
                            {venue.name}
                        </div>
                        <div className="w-20 shrink-0 text-[var(--text-muted)]">
                            {venue.teamCount} {venue.teamCount === 1 ? "team" : "teams"}
                        </div>
                        <div className="flex shrink-0 gap-2">
                            <button 
                                type="button"
                                className="btn-primary text-xs"
                                onClick={() => {
                                    setEditingVenue(venue);
                                    setVenueName(venue.name);
                                    setError(null);
                                }}
                            >
                                Edit
                            </button>
                            <button 
                                type="button"
                                className="btn-danger-subtle text-xs"
                                onClick={() => {
                                    setDeletingVenue(venue);
                                    setDeleteError(null);
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex justify-end mt-4">
                <button 
                    type="button"
                    className="btn-primary"
                    onClick={() => {
                        setNewVenueName("");
                        setCreateError(null);
                        setIsAddingVenue(true);
                    }}
                >
                    Add Venue
                </button>
            </div>


            {/* EDITING MODAL */}
            {editingVenue && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                    <div className="w-full max-w-md rounded-xl bg-[var(--background)] p-6 shadow-xl">
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold">
                                Edit Venue
                            </h2>

                            <p className="mt-1 text-sm opacity-70">
                                Update the venue information.
                            </p>
                        </div>

                        <div>
                            <label
                                htmlFor="venue-name"
                                className="mb-2 block text-sm font-semibold"
                            >
                                Venue Name
                            </label>

                            <input
                                id="venue-name"
                                type="text"
                                value={venueName}
                                onChange={(e) => setVenueName(e.target.value)}
                                className="form-input"
                            />

                            {error && (
                                <p className="mt-2 text-sm text-red-500">
                                    {error}
                                </p>
                            )}
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={() => setEditingVenue(null)}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="btn-primary"
                                onClick={handleSaveVenue}
                            >
                                {isSaving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* add venue modal */}
            {isAddingVenue && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                    <div className="w-full max-w-md rounded-xl bg-[var(--background)] p-6 shadow-xl">
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold">
                                Add Venue
                            </h2>

                            <p className="mt-1 text-sm opacity-70">
                                Add a location where your league plays.
                            </p>
                        </div>

                        <div>
                            <label
                                htmlFor="new-venue-name"
                                className="mb-2 block text-sm font-semibold"
                            >
                                Venue Name
                            </label>

                            <input
                                id="new-venue-name"
                                type="text"
                                value={newVenueName}
                                onChange={(e) => setNewVenueName(e.target.value)}
                                className="form-input"
                                autoFocus
                            />

                            {createError && (
                                <p className="mt-2 text-sm text-red-500">
                                    {createError}
                                </p>
                            )}
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={() => setIsAddingVenue(false)}
                                disabled={isCreating}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="btn-primary"
                                onClick={handleCreateVenue}
                                disabled={isCreating}
                            >
                                {isCreating ? "Adding..." : "Add Venue"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* DELETE venue confirmation modal */}
            {deletingVenue && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                    <div className="w-full max-w-md rounded-xl bg-[var(--background)] p-6 shadow-xl">
                        <h2 className="text-xl font-semibold">
                            Delete Venue
                        </h2>

                        <p className="mt-2 opacity-70">
                            Are you sure you want to delete{" "}
                            <strong>{deletingVenue.name}</strong>?
                        </p>

                        {deletingVenue.teamCount > 0 && (
                            <p className="mt-4 text-sm font-semibold">
                                This venue is currently assigned to{" "}
                                {deletingVenue.teamCount}{" "}
                                {deletingVenue.teamCount === 1 ? "team" : "teams"}.
                            </p>
                        )}

                        {deleteError && (
                            <p className="mt-4 text-sm text-red-500">
                                {deleteError}
                            </p>
                        )}

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={() => setDeletingVenue(null)}
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="btn-danger-subtle"
                                onClick={handleDeleteVenue}
                                disabled={isDeleting}
                            >
                                {isDeleting ? "Deleting..." : "Delete Venue"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}