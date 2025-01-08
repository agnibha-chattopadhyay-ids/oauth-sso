import NextAuth, { getServerSession, type NextAuthOptions, type Session } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./db";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import type { JWT } from "next-auth/jwt";

export type ExtendedUser = {
	id: string;
	name?: string | null;
	email?: string | null;
	image?: string | null;
	role?: "USER" | "ADMIN";
};

declare module "next-auth" {
	interface User extends ExtendedUser {
		role?: "USER" | "ADMIN";
	}
	interface Session {
		user: ExtendedUser;
		expires: string;
	}
}

declare module "next-auth/jwt" {
	interface JWT extends ExtendedUser {
		iat: number;
		exp: number;
		jti: string;
	}
}

export const config: NextAuthOptions = {
	adapter: PrismaAdapter(prisma),
	session: { strategy: "jwt" },
	pages: {
		signIn: "/auth/login",
		error: "/auth/error",
	},
	providers: [
		Google({
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
		}),
		Credentials({
			credentials: {
				email: { type: "email", label: "Email" },
				password: { type: "password", label: "Password" }
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) return null;

				const user = await prisma.user.findUnique({
					where: { email: credentials.email },
				});

				if (!user?.password) return null;

				const isValid = await compare(credentials.password, user.password);
				if (!isValid) return null;

				return {
					id: user.id,
					email: user.email,
					name: user.name,
					role: user.role,
				};
			},
		}),
	],
	callbacks: {
		async jwt({ token, user }: { token: JWT; user?: ExtendedUser }) {
			if (user) {
				token.role = user.role;
			}
			return token;
		},
		async session({ session, token }: { session: Session; token: JWT }) {
			if (session.user) {
				session.user.role = token.role;
			}
			return session;
		},
	},
};

export const handler = NextAuth(config);

export const auth = () => getServerSession(config);
export const { signIn, signOut } = handler;
export const { GET, POST } = handler; 