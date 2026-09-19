"use client";

import { useActionState } from "react";
import { register } from "@/app/register/actions";

const initialState = {
	error: null,
    name: "",
	email: "",
};

export default function RegisterForm() {
	const [state, formAction, pending] = useActionState(
		register,
		initialState
	);

	return (
		<form action={formAction} className="space-y-5">
			<div>
				<label
					htmlFor="name"
					className="mb-2 block text-sm font-semibold"
				>
					Name
				</label>

				<input
					id="name"
					name="name"
					type="text"
					autoComplete="name"
					required
					className="w-full rounded-md border border-white/10 bg-[var(--surface)] px-4 py-3 outline-none focus:border-[var(--accent)]"
                    defaultValue={state.name}
                />
			</div>

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
                    defaultValue={state.email}
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
					autoComplete="new-password"
					minLength={8}
					required
					className="w-full rounded-md border border-white/10 bg-[var(--surface)] px-4 py-3 outline-none focus:border-[var(--accent)]"
				/>
			</div>

			<div>
				<label
					htmlFor="passwordConfirmation"
					className="mb-2 block text-sm font-semibold"
				>
					Confirm Password
				</label>

				<input
					id="passwordConfirmation"
					name="passwordConfirmation"
					type="password"
					autoComplete="new-password"
					minLength={8}
					required
					className="w-full rounded-md border border-white/10 bg-[var(--surface)] px-4 py-3 outline-none focus:border-[var(--accent)]"
				/>
			</div>

			{state.error && (
				<div
					role="alert"
					className="rounded-md border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
				>
					{state.error}
				</div>
			)}

			<button
				type="submit"
				disabled={pending}
				className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
			>
				{pending ? "Creating Account..." : "Create Account"}
			</button>
		</form>
	);
}