"use client";

import { useRef, useState } from "react";

type ScheduleUploadStepProps = {
    file: File | null;
    errors: string[];
    onChange: (file: File | null) => void;
    onBack: () => void;
    onContinue: () => void;
};

export default function ScheduleUploadStep({
    file,
    errors,
    onChange,
    onBack,
    onContinue,
}: ScheduleUploadStepProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState<string | null>(null);

    function handleFile(file: File | undefined) {
        setError(null);

        if (!file) {
            onChange(null);
            return;
        }

        if (!file.name.toLowerCase().endsWith(".csv")) {
            setError("Please select a CSV file.");
            onChange(null);
            return;
        }

        onChange(file);
    }

    return (
        <div>
            <div className="mb-6">
                <h3 className="font-semibold">
                    Upload your schedule
                </h3>

                <p className="mt-1 text-sm opacity-70">
                    Upload a CSV containing the away team, home team,
                    date, and week for each match.
                </p>
            </div>

            <div className="rounded-lg border border-black/10 p-5">
                <label
                    htmlFor="schedule-csv"
                    className="mb-2 block text-sm font-semibold"
                >
                    Schedule CSV
                </label>

                <input
                    ref={inputRef}
                    id="schedule-csv"
                    type="file"
                    accept=".csv,text/csv"
                    onChange={(e) => handleFile(e.target.files?.[0])}
                />

                <p className="mt-3 text-xs opacity-60">
                    Required columns: away_team, home_team, date, week
                </p>

                {file && (
                    <p className="mt-4 text-sm font-medium">
                        Selected: {file.name}
                    </p>
                )}

                {error && (
                    <p className="mt-4 text-sm text-red-600">
                        {error}
                    </p>
                )}
            </div>

            {errors.length > 0 && (
                <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
                    <p className="text-sm font-semibold">
                        There are problems with this CSV:
                    </p>

                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                        {errors.map((error) => (
                            <li key={error}>
                                {error}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="mt-6 flex justify-between">
                <button
                    type="button"
                    className="btn-secondary"
                    onClick={onBack}
                >
                    Back
                </button>

                <button
                    type="button"
                    className="btn-primary"
                    onClick={onContinue}
                    disabled={!file}
                >
                    Continue
                </button>
            </div>
        </div>
    );
}