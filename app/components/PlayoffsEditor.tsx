"use client";

import { useEffect, useRef, useState } from "react";
import PlayoffEnabledStep from "./playoffs/PlayoffEnabledStep";
import PlayoffTeamCountStep from "./playoffs/PlayoffTeamCountStep";
import PlayoffRoundFormatStep from "./playoffs/PlayoffRoundFormatStep";
import PlayoffReseedStep from "./playoffs/PlayoffReseedStep";
import PlayoffReviewStep from "./playoffs/PlayoffReviewStep";

import { savePlayoffConfiguration } from "@/app/leagues/[slug]/settings/actions";

type PlayoffConfiguration = {
    id: number;
    teamCount: number;
    reseed: boolean;
    rounds: {
        round: number;
        name: string;
        bestOf: number;
    }[],
};

type PlayoffEditorEditorProps = {
    leagueId: number;
    seasonId: number;
    teamCount: number;
    playoff: PlayoffConfiguration | null;
    playoffsEnabled: boolean | null;
};

export default function PlayoffEditor({
    leagueId,
    seasonId,
    teamCount,
    playoff,
    playoffsEnabled,
}: PlayoffEditorProps) {

    const [step, setStep] = useState(1);

    const [hasPlayoffs, setHasPlayoffs] =
        useState<boolean | null>(playoff ? true : null);
    
    const [playoffTeamCount, setPlayoffTeamCount] =
        useState<number | null>(playoff?.teamCount ?? null);

    const [rounds, setRounds] =
        useState<PlayoffRoundConfig[]>(playoff?.rounds ?? []);

    function buildRounds(
        teamCount: number
    ): PlayoffRoundConfig[] {
        const roundCount = Math.ceil(
            Math.log2(teamCount)
        );

        return Array.from(
            { length: roundCount },
            (_, index) => {
                const teamsRemaining =
                    2 ** (roundCount - index);

                let name = `Round ${index + 1}`;

                if (teamsRemaining === 8) {
                    name = "Quarterfinals";
                } else if (teamsRemaining === 4) {
                    name = "Semifinals";
                } else if (teamsRemaining === 2) {
                    name = "Final";
                }

                return {
                    round: index + 1,
                    name,
                    bestOf: null,
                };
            }
        );
    }

    const [reseed, setReseed] =
        useState<boolean | null>(playoff?.reseed ?? null);

    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [playoffsSaved, setPlayoffsSaved] = useState(false);

    async function handleSave() {
        if (
            playoffTeamCount === null ||
            reseed === null
        ) {
            return;
        }

        setIsSaving(true);
        setSaveError(null);

        const result = await savePlayoffConfiguration(
            leagueId,
            seasonId,
            {
                teamCount: playoffTeamCount,
                reseed,
                rounds: rounds.map((round) => ({
                    round: round.round,
                    name: round.name,
                    bestOf: round.bestOf!,
                })),
            }
        );

        setIsSaving(false);

        if (!result.success) {
            setSaveError(
                result.error ??
                    "Unable to save playoff configuration."
            );

            return;
        }

        setPlayoffsSaved(true);
    }

    const [isEditing, setIsEditing] = useState(false);

    const [playoffsDisabled, setPlayoffsDisabled] = useState(false);

    if ((playoffsDisabled || playoffsEnabled === false) && !isEditing) {
        return (
            <div className="rounded-lg border border-black/10 p-5 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="font-semibold">
                        No playoffs
                    </p>

                    <p className="mt-1 text-sm opacity-70">
                        The regular-season standings will determine
                        the season champion.
                    </p>
                </div>
                <button
                    type="button"
                    className="btn-secondary w-auto"
                    onClick={() => {
                        setStep(1);
                        setIsEditing(true);
                    }}
                >
                    Edit playoff format
                </button>
            </div>
        );
    }

    if ((playoff || playoffsSaved) && !isEditing) {
        const savedTeamCount = playoff?.teamCount ?? playoffTeamCount;

        return (
            <div>
                <div className="mb-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="font-[family-name:var(--font-serif)] text-lg font-semibold text-[var(--accent)]">
                            Playoffs
                        </h3>

                        <p className="mt-1 text-sm text-[var(--text-muted)]">
                            The playoff format for this season has been configured.
                        </p>
                    </div>
                    <button
                        type="button"
                        className="btn-secondary w-auto"
                        onClick={() => {
                            setStep(1);
                            setIsEditing(true);
                        }}
                    >
                        Edit playoff format
                    </button>
                </div>

                <div className="rounded-lg border border-black/10 p-5">
                    <p className="font-semibold">
                        Playoff format ready
                    </p>

                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                        {savedTeamCount} teams will qualify for the playoffs.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <h3 className="mb-4 font-[family-name:var(--font-serif)] text-lg font-semibold text-[var(--accent)]">
                Playoffs
            </h3>
            {step === 1 && (
                <PlayoffEnabledStep
                    value={hasPlayoffs}
                    onChange={setHasPlayoffs}
                    onContinue={async () => {
                        if (hasPlayoffs === true) {
                            setStep(2);
                            return;
                        } 
                        
                        if (hasPlayoffs === false) {
                            setIsSaving(true);
                            setSaveError(null);

                            const result = await disableSeasonPlayoffs(
                                leagueId,
                                seasonId
                            );

                            setIsSaving(false);

                            if (!result.success) {
                                setSaveError(
                                    result.error ??
                                        "Unable to save playoff settings."
                                );

                                return;
                            }

                            // We'll use this to show the completed state.
                            setPlayoffsDisabled(true);
                        }
                    }}
                />
            )}

            {step === 2 && (
                <PlayoffTeamCountStep
                    teamCount={teamCount}
                    value={playoffTeamCount}
                    onChange={setPlayoffTeamCount}
                    onBack={() => setStep(1)}
                    onContinue={() => {
                        if (!playoffTeamCount) {
                            return;
                        }
                        
                        const newRounds = buildRounds(
                            playoffTeamCount
                        );

                        setRounds(
                            newRounds.map((round) => {
                                const existingRound = rounds.find(
                                    (existing) =>
                                        existing.name === round.name
                                );

                                return {
                                    ...round,
                                    bestOf:
                                        existingRound?.bestOf ??
                                        null,
                                };
                            })
                        );

                        setStep(3);
                    }}
                />
            )}

            {step === 3 && (
                <PlayoffRoundFormatStep
                    rounds={rounds}
                    onChange={setRounds}
                    onBack={() => setStep(2)}
                    onContinue={() => setStep(4)}
                />
            )}

            {step === 4 && (
                <PlayoffReseedStep
                    value={reseed}
                    onChange={setReseed}
                    onBack={() => setStep(3)}
                    onContinue={() => setStep(5)}
                />
            )}

            {step === 5 && (
                <PlayoffReviewStep
                    teamCount={playoffTeamCount!}
                    rounds={rounds}
                    reseed={reseed!}
                    onBack={() => setStep(4)}
                    onSave={handleSave}
                    isSaving={isSaving}
                    error={saveError}
                />
            )}
        </div>
    )
}