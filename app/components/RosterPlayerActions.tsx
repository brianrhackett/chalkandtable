"use client";

import { useState, useTransition } from "react";
import { 
    removeRosterPlayer, 
    updatePlayer, 
    findPlayerAccount, 
    linkPlayerAccount 
} from "@/app/leagues/[slug]/teams/[team-slug]/actions";

import { UserPen, UserMinus, X } from "lucide-react";

type Props = {
    rosterPlayerId: number;
    playerId: number;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
    leagueId: number;
    seasonId: number;
    teamId: number;
    canRemove: boolean;
    userId: number | null;
    captainPosition: "primary" | "co_captain" | null;
};

export default function RosterPlayerActions({
    rosterPlayerId,
    playerId,
    firstName,
    lastName,
    email,
    phone,
    leagueId,
    seasonId,
    teamId,
    canRemove,
    userId,
    captainPosition,
}: Props) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const [foundAccount, setFoundAccount] = useState<{
        id: number;
        email: string;
    } | null>(null);

    const [accountError, setAccountError] = useState<string | null>(null);

    function handleRemove() {
        if (!window.confirm(`Remove ${firstName} ${lastName} from this roster?`)) {
            return;
        }

        setError(null);

        startTransition(async () => {
            try {
                const result = await removeRosterPlayer(
                    rosterPlayerId,
                    leagueId,
                    seasonId,
                    teamId
                );

                if (!result.success) {
                    setError(result.error ?? "Unable to remove player.");
                }
            } catch {
                setError("Unable to remove player.");
            }
        });
    }

    const [showEditModal, setShowEditModal] = useState(false);

    function handleEditPlayer(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);

        setError(null);

        startTransition(async () => {
            try {
                const result = await updatePlayer(
                    playerId,
                    leagueId,
                    String(formData.get("firstName") ?? ""),
                    String(formData.get("lastName") ?? ""),
                    String(formData.get("email") ?? ""),
                    String(formData.get("phone") ?? "")
                );

                if (!result.success) {
                    setError(result.error ?? "Unable to update player.");
                    return;
                }

                setShowEditModal(false);
            } catch {
                setError("Unable to update player.");
            }
        });
    }

    function handleFindAccount() {
        setAccountError(null);
        setFoundAccount(null);

        startTransition(async () => {
            try {
                const result = await findPlayerAccount(
                    playerId,
                    leagueId
                );

                if (!result.success || !result.account) {
                    setAccountError(
                        result.error ?? "Unable to find account."
                    );
                    return;
                }

                setFoundAccount(result.account);
            } catch {
                setAccountError("Unable to find account.");
            }
        });
    }

    function handleLinkAccount() {
        if (!foundAccount) {
            return;
        }

        setAccountError(null);

        startTransition(async () => {
            try {
                const result = await linkPlayerAccount(
                    playerId,
                    leagueId,
                    foundAccount.id
                );

                if (!result.success) {
                    setAccountError(
                        result.error ?? "Unable to link account."
                    );
                    return;
                }

                setFoundAccount(null);
                setShowEditModal(false);
                window.location.reload();
            } catch(error) {
                console.error("Account linking failed:", error);
                setAccountError("Unable to link account.");
            }
        });
    }

    return (
        <div className="flex gap-2">
            <button
                className="btn-primary px-2"
                onClick={() => {
                    setError(null);
                    setShowEditModal(true);
                }}
                title="Edit Player"
            >
                <UserPen className="inline size-4"/>
            </button>
            {canRemove && (
                <button
                    type="button"
                    onClick={handleRemove}
                    disabled={isPending || !canRemove}
                    className="btn-danger px-2"
                    title="Remove Player"
                >
                    <UserMinus className="inline size-4"/>
                </button>
            )}

            {error && (
                <span role="alert" className="text-xs text-[var(--danger)]">
                    {error}
                </span>
            )}
            
            {showEditModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-lg rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl">
                        <div className="mb-6 flex items-start justify-between">
                            <div>
                                <h2 className="text-xl font-semibold">
                                    Edit Player
                                </h2>

                                <p className="mt-1 text-sm text-[var(--text-muted)]">
                                    Update player information.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowEditModal(false)}
                                disabled={isPending}
                                aria-label="Close"
                                className="text-[var(--text-muted)] cursor-pointer"
                            >
                                <X />
                            </button>
                        </div>

                        <form
                            onSubmit={handleEditPlayer}
                            className="space-y-4"
                        >
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label
                                        htmlFor={`firstName-${playerId}`}
                                        className="mb-1 block text-sm font-medium"
                                    >
                                        First Name
                                    </label>

                                    <input
                                        id={`firstName-${playerId}`}
                                        name="firstName"
                                        defaultValue={firstName}
                                        required
                                        className="form-input"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor={`lastName-${playerId}`}
                                        className="mb-1 block text-sm font-medium"
                                    >
                                        Last Name
                                    </label>

                                    <input
                                        id={`lastName-${playerId}`}
                                        name="lastName"
                                        defaultValue={lastName}
                                        required
                                        className="form-input"
                                    />
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor={`email-${playerId}`}
                                    className="mb-1 block text-sm font-medium"
                                >
                                    Email
                                </label>

                                <input
                                    id={`email-${playerId}`}
                                    name="email"
                                    type="email"
                                    defaultValue={email ?? ""}
                                    className="form-input"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor={`phone-${playerId}`}
                                    className="mb-1 block text-sm font-medium"
                                >
                                    Phone
                                </label>

                                <input
                                    id={`phone-${playerId}`}
                                    name="phone"
                                    type="tel"
                                    defaultValue={phone ?? ""}
                                    className="form-input"
                                />
                            </div>
                            
                            {captainPosition !== null && (
                                <div className="border-t border-[var(--surface-alt)] pt-4">
                                    <h3 className="text-sm font-semibold">
                                        Account Access
                                    </h3>

                                    {userId ? (
                                        <p className="mt-2 text-sm text-[var(--text-muted)]">
                                            This player is linked to a Chalk & Table account.
                                        </p>
                                    ) : (
                                        <div className="mt-2">
                                            <p className="text-sm text-[var(--text-muted)]">
                                                This player is not linked to a user account.
                                            </p>

                                            <button
                                                type="button"
                                                onClick={handleFindAccount}
                                                className="btn-primary mt-3"
                                                disabled={isPending}
                                            >
                                                {isPending ? "Searching..." : "Link User Account"}
                                            </button>
                                            
                                            {accountError && (
                                                <p
                                                    role="alert"
                                                    className="mt-3 text-sm text-[var(--danger)]"
                                                >
                                                    {accountError}
                                                </p>
                                            )}

                                            {foundAccount && (
                                                <div className="mt-4 rounded-md border border-[var(--border)] bg-[var(--surface-alt)] p-4">
                                                    <p className="text-sm font-semibold">
                                                        Account Found
                                                    </p>

                                                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                                                        {foundAccount.email}
                                                    </p>

                                                    <p className="mt-3 text-xs text-[var(--text-muted)]">
                                                        Linking this account will allow this player to
                                                        sign in using their existing credentials.
                                                    </p>

                                                    <button
                                                        type="button"
                                                        onClick={handleLinkAccount}
                                                        className="btn-primary mt-3"
                                                        disabled={isPending}
                                                    >
                                                        {isPending ? "Linking..." : "Confirm Account Link"}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {error && (
                                <p role="alert" className="text-sm text-[var(--danger)]">
                                    {error}
                                </p>
                            )}

                            <div className="flex justify-end gap-3 border-t border-[var(--surface-alt)] pt-5">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    disabled={isPending}
                                    className="btn-tertiary"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="btn-primary disabled:opacity-50"
                                >
                                    {isPending ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}





