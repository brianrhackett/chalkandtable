import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { db } from "./src/prisma/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
	providers: [
		Credentials({
			credentials: {
				email: {},
				password: {},
			},

			async authorize(credentials) {
				const email = credentials.email?.toString().trim().toLowerCase();
				const password = credentials.password?.toString();

				if (!email || !password) {
					return null;
				}

				const user = await db.orm.public.User.first({
					email,
				});

				if (!user) {
					return null;
				}

				const passwordMatches = await bcrypt.compare(
					password,
					user.password
				);

				if (!passwordMatches) {
					return null;
				}

				return {
					id: user.id.toString(),
					name: user.name,
					email: user.email,
				};
			},
		}),
	],
});