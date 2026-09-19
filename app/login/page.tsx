import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import LoginForm from "@/app/components/LoginForm";

export default function LoginPage() {
	return (
		<>
			<Header />

			<main className="mx-auto flex min-h-[calc(100vh-80px)] max-w-7xl items-center justify-center px-6 py-16">
				<div className="w-full max-w-md">
					<div className="mb-8 text-center">
						<h1 className="font-[family-name:var(--font-display)] text-5xl uppercase leading-none">
							Welcome Back
						</h1>

						<p className="mt-3 text-[var(--text-muted)]">
							Sign in to your Chalk & Table account.
						</p>
					</div>

					<LoginForm />

					<p className="mt-6 text-center text-sm text-[var(--text-muted)]">
						Don't have an account?{" "}
						<Link
							href="/register"
							className="font-semibold text-[var(--accent)] hover:underline"
						>
							Create one
						</Link>
					</p>
				</div>
			</main>

            <Footer />
		</>
	);
}