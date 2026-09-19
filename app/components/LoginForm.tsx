"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
	const router = useRouter();

	const [error, setError] = useState<string | null>(null);
	const [pending, setPending] = useState(false);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		setError(null);
		setPending(true);

		const formData = new FormData(event.currentTarget);

		const email = formData.get("email")?.toString().trim().toLowerCase() ?? "";
		const password = formData.get("password")?.toString() ?? "";

		try {
			const result = await signIn("credentials", {
				email,
				password,
				redirect: false,
			});

			if (result?.error) {
				setError("Invalid email or password.");
				return;
			}

			router.push("/dashboard");
			router.refresh();
		} catch {
			setError("Something went wrong. Please try again.");
		} finally {
			setPending(false);
		}
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-5">
			<div>
				<label
					htmlFor="email"
					className="mb-2 block text-sm font-semibold"
				>
					Email
				</label>

				<input
					id="email"
					name="email"
					type="email"
					autoComplete="email"
					required
					className="w-full rounded-md border border-white/10 bg-[var(--surface)] px-4 py-3 outline-none focus:border-[var(--accent)]"
				/>
			</div>

			<div>
				<label
					htmlFor="password"
					className="mb-2 block text-sm font-semibold"
				>
					Password
				</label>

				<input
					id="password"
					name="password"
					type="password"
					autoComplete="current-password"
					required
					className="w-full rounded-md border border-white/10 bg-[var(--surface)] px-4 py-3 outline-none focus:border-[var(--accent)]"
				/>
			</div>

			{error && (
				<div
					role="alert"
					className="rounded-md border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
				>
					{error}
				</div>
			)}

			<button
				type="submit"
				disabled={pending}
				className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
			>
				{pending ? "Signing In..." : "Sign In"}
			</button>
		</form>
	);
}