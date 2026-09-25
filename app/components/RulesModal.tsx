"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import RulesEditor from "@/app/components/RulesEditor";
import { updateSeasonRules } from "@/app/leagues/[slug]/settings/actions";

type RulesModalProps = {
	season: {
		id: number;
		name: string;
		rules: string | null;
	};
	onClose: () => void;
};

export default function RulesModal({
	season,
	onClose,
}: RulesModalProps) {
    const router = useRouter();

	const [rules, setRules] = useState(
		season.rules ?? ""
	);

    const [error, setError] = useState<string | null>(
        null
    );

    const [isPending, startTransition] =
	    useTransition();


    function handleSave() {
        setError(null);

        startTransition(async () => {
            const result = await updateSeasonRules(
                season.id,
                rules
            );

            if (!result.success) {
                setError(result.message);
                return;
            }

            router.refresh();
            onClose();
        });
    }

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
			<div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg border border-[var(--surface-alt)] bg-[var(--surface)] shadow-xl">
				<div className="flex items-start justify-between border-b border-[var(--surface-alt)] px-6 py-5">
					<div>
						<h2 className="font-[family-name:var(--font-serif)] text-2xl">
							Edit League Rules
						</h2>

						<p className="mt-1 text-sm text-[var(--text-muted)]">
							{season.name} season
						</p>
					</div>

					<button
						type="button"
						onClick={onClose}
						className="text-2xl leading-none text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
						aria-label="Close"
					>
						&times;
					</button>
				</div>

				<div className="p-6">
					<p className="mb-4 text-sm text-[var(--text-muted)]">
						Type your league rules or paste them from an
						existing document.
					</p>

					<RulesEditor
						value={rules}
						onChange={setRules}
					/>

                    {error && (
                        <p className="mt-3 text-sm text-red-500">
                            {error}
                        </p>
                    )}
				</div>

				<div className="flex justify-end gap-3 border-t border-[var(--surface-alt)] px-6 py-4">
					<button
						type="button"
						onClick={onClose}
						className="rounded-md px-4 py-2 text-sm font-semibold text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
					>
						Cancel
					</button>

					<button
						type="button"
                        onClick={handleSave}
	                    disabled={isPending}
						className="btn-primary"
					>
						{isPending ? "Saving..." : "Save Rules"}
					</button>
				</div>
			</div>
		</div>
	);
}