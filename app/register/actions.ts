"use server";

import bcrypt from "bcryptjs";
import { db } from "../../src/prisma/db";

export type RegisterState = {
	error: string | null;
    name: string;
    email: string;
};

export async function register(
	previousState: RegisterState,
	formData: FormData
): Promise<RegisterState> {
	const name = formData.get("name")?.toString().trim() ?? "";
	const email = formData.get("email")?.toString().trim().toLowerCase() ?? "";
	const password = formData.get("password")?.toString() ?? "";
	const passwordConfirmation = formData
		.get("passwordConfirmation")
		?.toString() ?? "";

    const values = {
        name,
        email
    };
    
	if (!name || !email || !password || !passwordConfirmation) {
		return {
            error: "All fields are required.",
            ...values,
        }
	}

	if (password !== passwordConfirmation) {
		return {
            error: "Passwords do not match.",
            ...values,
        }
	}

	if (password.length < 8) {
		return {
            error: "Password must be at least 8 characters.",
            ...values,
        }
	}

	const existingUser = await db.orm.public.User.first({ email: email });

	if (existingUser) {
		return {
            error: "An account with that email already exists.",
            ...values,
        }
	}

	const hashedPassword = await bcrypt.hash(password, 12);

	await db.orm.public.User.create({
        name,
        email,
        password: hashedPassword,
	});

    return {
		error: null,
        name: "",
        email: "",
	};
}