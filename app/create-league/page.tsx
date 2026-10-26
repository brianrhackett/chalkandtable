import { auth } from "@/auth";
import { redirect } from "next/navigation";
import CreateLeagueForm from "@/app/components/CreateLeagueForm";

export default async function CreateLeaguePage() {
    const session = await auth();

    if (!session?.user?.email) {
        redirect("/login");
    }

    return (
        <main className="mx-auto max-w-2xl px-5 py-10">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[var(--text)]">
                    Create League
                </h1>

                <p className="mt-2 text-[var(--text-muted)]">
                    Give your league a name to get started.
                    You can configure teams, venues, and
                    seasons afterward.
                </p>
            </div>

            <CreateLeagueForm />
        </main>
    );
}