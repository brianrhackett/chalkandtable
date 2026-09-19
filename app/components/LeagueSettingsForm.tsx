"use client";

import { useActionState } from "react";
import ThemePicker from "@/app/components/ThemePicker";

import type { ThemeKey } from "@/src/lib/themes";

import {
	updateLeagueSettings,
	type LeagueSettingsState,
} from "@/app/leagues/[slug]/settings/actions";

type LeagueSettingsFormProps = {
	league: {
		id: number;
		name: string;
		slug: string;
		theme: string;
		playerStatsEnabled: boolean;
	};
};

const initialState: LeagueSettingsState = {
	error: null,
	success: false,
};

export default function LeagueSettingsForm({
	league,
}: LeagueSettingsFormProps) {
	const updateSettings = updateLeagueSettings.bind(
		null,
		league.id
	);

	const [state, formAction, pending] = useActionState(
		updateSettings,
		initialState
	);

    return (
        <form 
            action={formAction} 
            className="mt-10 space-y-6"
        >
            {/* General */}
            <section className="mt-8 rounded-lg border border-[var(--surface-alt)] bg-[var(--surface)] p-6">
                <div className="mb-6">
                    <h2 className="font-[family-name:var(--font-serif)] text-2xl">
                        General
                    </h2>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                        Basic information about your league
                    </p>
                </div>

                <div className="space-y-5">
                    <div>
                        <label
                            htmlFor="name"
                            className="mb-2 block text-sm font-semibold"
                        >
                            League Name
                        </label>

                        <input
                            id="name"
                            name="name"
                            type="text"
                            defaultValue={league.name}
                            className="w-full rounded-md border border-[var(--surface-alt)] bg-[var(--background)] px-4 py-3 outline-none transition-colors focus:border-[var(--accent)]"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="slug"
                            className="mb-2 block text-sm font-semibold"
                        >
                            League URL
                        </label>

                        <div className="flex">
                            <span className="flex items-center rounded-l-md border border-r-0 border-[var(--surface-alt)] bg-[var(--surface-alt)] px-4 text-sm text-[var(--text-muted)]">
                                /leagues/
                            </span>

                            <input
                                id="slug"
                                name="slug"
                                type="text"
                                defaultValue={league.slug}
                                className="min-w-0 flex-1 rounded-r-md border border-[var(--surface-alt)] bg-[var(--background)] px-4 py-3 outline-none transition-colors focus:border-[var(--accent)]"
                            />
                        </div>

                        <p className="mt-2 text-xs text-[var(--text-muted)]">
                            This is the public URL for your league.
                        </p>
                    </div>
                </div>
            </section>

            {/* Appearance */}
            <section className="rounded-lg border border-[var(--surface-alt)] bg-[var(--surface)] p-6">
                <div className="mb-6">
                    <h2 className="font-[family-name:var(--font-serif)] text-2xl">
                        Appearance
                    </h2>

                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                        Choose the color scheme used throughout your league pages.
                    </p>
                </div>

                <ThemePicker currentTheme={league.theme as ThemeKey} />
                
            </section>
                

            {/* Features */}
            <section className="rounded-lg border border-[var(--surface-alt)] bg-[var(--surface)] p-6">
                <div className="mb-6">
                    <h2 className="font-[family-name:var(--font-serif)] text-2xl">
                        Features
                    </h2>

                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                        Enable or disable optional features for your league.
                    </p>
                </div>

                <label className="flex cursor-pointer items-center justify-between gap-6 rounded-md border border-[var(--surface-alt)] bg-[var(--background)] p-5">
                    <div>
                        <p className="font-semibold">
                            Player Statistics
                        </p>

                        <p className="mt-1 text-sm text-[var(--text-muted)]">
                            Track individual player and rack statistics throughout the season.
                        </p>
                    </div>

                    <div className="relative shrink-0">
                        <input
                            type="checkbox"
                            name="playerStatsEnabled"
                            defaultChecked={league.playerStatsEnabled}
                            className="peer sr-only"
                        />

                        <div className="h-6 w-11 rounded-full bg-[var(--surface-alt)] transition-colors peer-checked:bg-[var(--accent)]" />

                        <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
                    </div>
                </label>
            </section>

            {state.error && (
				<p className="text-sm text-red-500">
					{state.error}
				</p>
			)}

			{state.success && (
				<p className="text-sm text-[var(--accent)]">
					League settings saved.
				</p>
			)}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
                <button
                    type="reset"
                    className="btn-secondary"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    className="btn-primary"
                >
                    Save Changes
                </button>
            </div>
        </form>
    )
}