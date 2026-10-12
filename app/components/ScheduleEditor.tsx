"use client";

import { useEffect, useRef, useState } from "react";
import ScheduleMethodStep from "./scheduler/ScheduleMethodStep";
import ScheduleDatesStep from "./scheduler/ScheduleDatesStep";
import ExcludedDatesStep from "./scheduler/ExcludedDatesStep";
import ScheduleFormatStep from "./scheduler/ScheduleFormatStep";
import ScheduleReviewStep from "./scheduler/ScheduleReviewStep";
import SchedulePreview from "./scheduler/SchedulePreview";

import ScheduleUploadStep from "./scheduler/ScheduleUploadStep";

import { saveSchedule } from "@/app/leagues/[slug]/settings/actions";

import { 
    generateRoundRobinSchedule,
    type GeneratedSchedule, 
} from "@/src/lib/scheduling/generateRoundRobinSchedule";

import {
    parseScheduleCsv,
    type ScheduleCsvRow,
} from "@/src/lib/scheduling/parseScheduleCsv";

export type ScheduleMethod = "generate" | "upload";
export type ScheduleFormat =
	| "single"
	| "home-away"
	| "fixed";

type ScheduleEditorProps = {
    leagueId: number;
    seasonId: number;
    hasSchedule: boolean;
	teams: {
		id: number;
		name: string;
		venueId: number;
	}[];
};

export default function ScheduleEditor({
    leagueId,
    seasonId,
    hasSchedule,
    teams,
}: ScheduleEditorProps) {
    
    const schedulerRef = useRef<HTMLDivElement>(null);

	const [step, setStep] = useState(1);
	const [scheduleMethod, setScheduleMethod] =
		useState<ScheduleMethod | null>(null);

    const [dayOfWeek, setDayOfWeek] = useState("");
    const [startDate, setStartDate] = useState("");

    const [excludedDates, setExcludedDates] = useState<string[]>([]);

    const [scheduleFormat, setScheduleFormat] =
	    useState<ScheduleFormat | null>(null);

    const [maxWeeks, setMaxWeeks] =
	    useState<number | null>(null);

    const [generatedSchedule, setGeneratedSchedule] =
    	useState<GeneratedSchedule | null>(null);

    const [scheduleSaved, setScheduleSaved] = useState(false);

    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    /* csv uploader vars */
    const [scheduleFile, setScheduleFile] = useState<File | null>(null);

    const [uploadErrors, setUploadErrors] =
        useState<string[]>([]);

    /* csv functions */
    async function handleScheduleUpload() {
        if (!scheduleFile) {
            return;
        }

        setUploadErrors([]);

        const result = await parseScheduleCsv(scheduleFile);

        if (!result.success) {
            setUploadErrors(result.errors);
            return;
        }

        const teamMap = new Map(
            teams.map((team) => [
                team.name.trim().toLowerCase(),
                team,
            ])
        );

        const errors: string[] = [];

        result.rows.forEach((row, index) => {
            const rowNumber = index + 2;

            const awayTeam = teamMap.get(
                row.awayTeam.trim().toLowerCase()
            );

            const homeTeam = teamMap.get(
                row.homeTeam.trim().toLowerCase()
            );

            if (!awayTeam) {
                errors.push(
                    `Row ${rowNumber}: Unknown away team "${row.awayTeam}".`
                );
            }

            if (!homeTeam) {
                errors.push(
                    `Row ${rowNumber}: Unknown home team "${row.homeTeam}".`
                );
            }
        });

        if (errors.length > 0) {
            setUploadErrors(errors);
            return;
        }

        const weekMap = new Map<
            number,
            GeneratedSchedule["weeks"][number]
        >();

        for (const row of result.rows) {
            const awayTeam = teamMap.get(
                row.awayTeam.trim().toLowerCase()
            )!;

            const homeTeam = teamMap.get(
                row.homeTeam.trim().toLowerCase()
            )!;

            let week = weekMap.get(row.week);

            if (!week) {
                week = {
                    week: row.week,
                    date: row.date,
                    byeTeamId: null,
                    matches: [],
                };

                weekMap.set(row.week, week);
            }

            week.matches.push({
                week: row.week,
                awayTeamId: awayTeam.id,
                homeTeamId: homeTeam.id,
                scheduledAt: row.date,
            });
        }
        const schedule: GeneratedSchedule = {
            weeks: Array.from(weekMap.values()).sort(
                (a, b) => a.week - b.week
            ),
        };

        setGeneratedSchedule(schedule);
    }

    /* generator functions */
    async function handleSaveSchedule() {
        if (!generatedSchedule) {
            return;
        }

        setIsSaving(true);
        setSaveError(null);

        const result = await saveSchedule(
            leagueId,
            seasonId,
            generatedSchedule
        );

        setIsSaving(false);

        if (!result.success) {
            setSaveError(
                result.error ?? "Unable to save schedule."
            );

            return;
        }

        setScheduleSaved(true);
    }

    function handleGenerate() {
        if (!scheduleFormat) {
            return;
        }

        const schedule = generateRoundRobinSchedule(
            teams,
            {
                startDate,
                excludedDates,
                format: scheduleFormat,
                maxWeeks,
            }
        );

        setGeneratedSchedule(schedule);
    }

    useEffect(() => {
        if (step === 1 && !generatedSchedule) {
            return;
        }

        schedulerRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    }, [step, generatedSchedule]);

    if (hasSchedule || scheduleSaved) {
        return (
            <div>
                <div className="mb-6">
                    <h3 className="font-[family-name:var(--font-serif)] text-lg text-[var(--accent)] font-semibold">
                        Schedule
                    </h3>

                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                        The schedule for this season has already been generated.
                    </p>
                </div>

                <div className="rounded-lg border border-black/10 p-5">
                    <p className="font-semibold">
                        Schedule ready
                    </p>

                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                        Matches have been scheduled for this season.
                    </p>
                </div>
            </div>
        );
    }

    if (generatedSchedule) {
        return (
            <SchedulePreview
                schedule={generatedSchedule}
                teams={teams}
                onBack={() => setGeneratedSchedule(null)}
                onSave={handleSaveSchedule}
            />
        );
    }

    return (
		<div ref={schedulerRef}>
            <div className="mb-6 flex items-center justify-between">
                <h3 className="font-[family-name:var(--font-serif)] text-lg text-[var(--accent)] font-semibold">
                    Schedule
                </h3>

                <span className="text-sm opacity-60">
                    Step {step} of {scheduleMethod === "upload" ? 2 : 5}
				</span>
            </div>

            {step === 1 && (
                <ScheduleMethodStep
                    value={scheduleMethod}
                    onChange={setScheduleMethod}
                    onContinue={() => setStep(2)}
                />
            )}

            {step === 2 && scheduleMethod === "generate" && (
                <ScheduleDatesStep
                    dayOfWeek={dayOfWeek}
                    startDate={startDate}
                    onDayOfWeekChange={setDayOfWeek}
                    onStartDateChange={setStartDate}
                    onBack={() => setStep(1)}
                    onContinue={() => setStep(3)}
                />
            )}

            {step === 2 && scheduleMethod === "upload" && (
                <ScheduleUploadStep
                    file={scheduleFile}
                    errors={uploadErrors}
                    onChange={(file) => {
                        setScheduleFile(file);
                        setUploadErrors([]);
                    }}
                    onBack={() => setStep(1)}
                    onContinue={handleScheduleUpload}
                />
            )}

            {step === 3 && (
                <ExcludedDatesStep
                    dayOfWeek={dayOfWeek}
                    startDate={startDate}
                    excludedDates={excludedDates}
                    onChange={setExcludedDates}
                    onBack={() => setStep(2)}
                    onContinue={() => setStep(4)}
                />
            )}

            {step === 4 && (
                <ScheduleFormatStep
                    format={scheduleFormat}
                    maxWeeks={maxWeeks}
                    onFormatChange={setScheduleFormat}
                    onMaxWeeksChange={setMaxWeeks}
                    onBack={() => setStep(3)}
                    onContinue={() => setStep(5)}
                />
            )}

            {step === 5 && (
                <ScheduleReviewStep
                    teamCount={teams.length}
                    dayOfWeek={dayOfWeek}
                    startDate={startDate}
                    excludedDates={excludedDates}
                    format={scheduleFormat!}
                    maxWeeks={maxWeeks}
                    onBack={() => setStep(4)}
                    onGenerate={handleGenerate}
                />
            )}
        </div>
    );
}