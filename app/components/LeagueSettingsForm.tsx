"use client";

import { useActionState, useState } from "react";
import ThemePicker from "@/app/components/ThemePicker";
import RulesModal from "@/app/components/RulesModal";
import TeamsEditor from "@/app/components/TeamsEditor";
import VenuesEditor from "@/app/components/VenuesEditor";
import ScheduleEditor from "@/app/components/ScheduleEditor";
import PlayoffsEditor from "@/app/components/PlayoffsEditor";

import type { ThemeKey } from "@/src/lib/themes";

import {
	updateLeagueSettings,
	type LeagueSettingsState,
} from "@/app/leagues/[slug]/settings/actions";

type PlayoffConfiguration = {
    id: number;
    teamCount: number;
    reseed: boolean;
};

type LeagueSettingsFormProps = {
	league: {
		id: number;
		name: string;
		slug: string;
		theme: string;
		playerStatsEnabled: boolean;
        venues: {
            id: number;
            name: string;
            teamCount: number;
        }[]
	};
    season: {
		id: number;
		name: string;
		rules: string | null;
        hasSchedule: boolean;
        teams: {
            id: number;
            name: string;
            venueId: number;
        }[],
        playoffs: PlayoffConfiguration | null;
        playoffsEnabled: boolean | null;
	};
};

const initialState: LeagueSettingsState = {
	error: null,
	success: false,
};

export default function LeagueSettingsForm({
	league,
    season,
}: LeagueSettingsFormProps) {
	const updateSettings = updateLeagueSettings.bind(
		null,
		league.id
	);

	const [state, formAction, pending] = useActionState(
		updateSettings,
		initialState
	);

    const [rulesModalOpen, setRulesModalOpen] = useState(false);

    return (
        <>
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

                {/* League Teams & Schedule */}
                <section className="mt-8 rounded-lg border border-[var(--surface-alt)] bg-[var(--surface)] p-6">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="font-[family-name:var(--font-serif)] text-2xl">
                                Teams & Schedule
                            </h2>

                            <p className="mt-1 text-sm text-[var(--text-muted)]">
                                Manage the teams and schedule for the {season.name} season.
                            </p>
                        </div>
                    </div>
                    <div className="mt-4 grid grid-cols-1">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                            <div className="p-4 rounded-lg border border-[var(--surface-alt)] bg-[var(--background)]">
                                <VenuesEditor
                                    leagueId={league.id}
                                    venues={league.venues}
                                />
                            </div>
                            <div className="p-4 rounded-lg border border-[var(--surface-alt)] bg-[var(--background)]">
                                <TeamsEditor 
                                    leagueId={league.id}
                                    seasonId={season.id}
                                    teams={season.teams}
                                    venues={league.venues}
                                />
                            </div>
                        </div>
                        <div className="col-span-2 p-4 rounded-lg border border-[var(--surface-alt)] bg-[var(--background)]">
                            <ScheduleEditor
                                leagueId={league.id}
                                seasonId={season.id}
                                teams={season.teams}
                                hasSchedule={season.hasSchedule}
                            />
                        </div>

                    </div>
                </section>

                {/* Playoff settings */}
                <section className="mt-8 rounded-lg border border-[var(--surface-alt)] bg-[var(--surface)] p-6">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="font-[family-name:var(--font-serif)] text-2xl">
                                Playoff Configuration
                            </h2>

                            <p className="mt-1 text-sm text-[var(--text-muted)]">
                                Configure your playoff settings for the {season.name} season.
                            </p>
                        </div>
                    </div>
                    <div className="mt-4 grid grid-cols-1 gap-5">
                        <div className="p-4 rounded-lg border border-[var(--surface-alt)] bg-[var(--background)]">
                            <PlayoffsEditor
                                leagueId={league.id}
                                seasonId={season.id}
                                teamCount={season.teams.length}
                                playoff={season.playoff}
                                playoffsEnabled={season.playoffsEnabled}
                            />
                        </div>
                    </div>
                    
                </section>

                {/* League Rules */}
                <section className="mt-8 rounded-lg border border-[var(--surface-alt)] bg-[var(--surface)] p-6">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="font-[family-name:var(--font-serif)] text-2xl">
                                League Rules
                            </h2>

                            <p className="mt-1 text-sm text-[var(--text-muted)]">
                                Manage the rules for the {season.name} season.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setRulesModalOpen(true)}
                            className="btn-primary shrink-0"
                        >
                            {season.rules ? "Edit Rules" : "Add Rules"}
                        </button>
                    </div>

                    {season.rules ? (
                        <p className="mt-5 border-t border-[var(--surface-alt)] pt-5 text-sm text-[var(--text-muted)]">
                            Rules have been published for this season.
                        </p>
                    ) : (
                        <p className="mt-5 border-t border-[var(--surface-alt)] pt-5 text-sm text-[var(--text-muted)]">
                            No rules have been published for this season.
                        </p>
                    )}
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

            {rulesModalOpen && (
                <RulesModal
                    season={season}
                    onClose={() =>
                        setRulesModalOpen(false)
                    }
                />
            )}
        </>
    )
}