"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createLeague } from "@/app/create-league/actions";

export default function CreateLeagueForm() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [seasonName, setSeasonName] = useState("");
    const [error, setError] = useState(""); 
    const [isPending, startTransition] = useTransition();

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");

        startTransition(async () => {
            const result = await createLeague(name, seasonName);

            if (!result.success) {
                setError(result.error ?? "Unable to create league.");
                return;
            }

            router.push(`/leagues/${result.slug}/settings`);
        });
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium text-[var(--text)]"
                >
                    League Name
                </label>

                <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    maxLength={100}
                    placeholder="e.g. Billiard City Pool League"
                    className="form-input"
                />
            </div>

            <div>
                <label
                    htmlFor="seasonName"
                    className="mb-2 block text-sm font-medium text-[var(--text)]"
                >
                    Current Season Name
                </label>

                <input
                    id="seasonName"
                    type="text"
                    value={seasonName}
                    onChange={(e) => setSeasonName(e.target.value)}
                    required
                    maxLength={100}
                    placeholder="e.g. 2026-2027"
                    className="form-input"
                />

                <p className="mt-2 text-sm text-[var(--text-muted)]">
                    Give your first season a name. You can create additional
                    seasons later.
                </p>
            </div>

            {error && (
                <p role="alert" className="text-sm text-[var(--danger)]">
                    {error}
                </p>
            )}

            <button
                type="submit"
                disabled={isPending || !name.trim() || !seasonName.trim()}
                className="btn-primary"
            >
                {isPending ? "Creating..." : "Create League"}
            </button>
        </form>
    );
}