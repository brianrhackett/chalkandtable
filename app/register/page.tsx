import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import RegisterForm from "@/app/components/RegisterForm";

export default function RegisterPage() {
	return (
		<>
			<Header />

			<main className="mx-auto flex min-h-[calc(100vh-80px)] max-w-7xl items-center justify-center px-6 py-16">
				<div className="w-full max-w-md">
					<div className="mb-8 text-center">
						<h1 className="font-[family-name:var(--font-display)] text-5xl uppercase leading-none">
							Create Your Account
						</h1>

						<p className="mt-3 text-[var(--text-muted)]">
							Get started with Chalk & Table.
						</p>
					</div>

					<RegisterForm />

					<p className="mt-6 text-center text-sm text-[var(--text-muted)]">
						Already have an account?{" "}
						<Link
							href="/login"
							className="font-semibold text-[var(--accent)] hover:underline"
						>
							Sign in
						</Link>
					</p>
				</div>
			</main>

            <Footer />
		</>
	);
}