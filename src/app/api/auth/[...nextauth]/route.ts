import NextAuth, { DefaultSession, NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/db";
import { compare } from "bcryptjs";

declare module "next-auth" {
	interface Session extends DefaultSession {
		user: {
			id: string;
		} & DefaultSession[ "user" ]
	}
}

export const authOptions: NextAuthOptions = {
	adapter: PrismaAdapter(prisma),
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
			allowDangerousEmailAccountLinking: true,
		}),
		CredentialsProvider({
			name: "credentials",
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" }
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					return null;
				}

				try {
					const user = await prisma.user.findUnique({
						where: { email: credentials.email },
						select: {
							id: true,
							email: true,
							name: true,
							password: true,
						},
					});

					if (!user || !user.password) {
						return null;
					}

					const isPasswordValid = await compare(credentials.password, user.password);

					if (!isPasswordValid) {
						return null;
					}

					return {
						id: user.id,
						email: user.email,
						name: user.name,
					};
				} catch (error) {
					console.error("Auth error:", error);
					return null;
				}
			}
		})
	],
	session: {
		strategy: "jwt"
	},
	pages: {
		signIn: "/auth/login",
		error: "/auth/error"
	},
	callbacks: {
		async session({ token, session }) {
			if (token && session.user) {
				session.user.id = token.id as string;
				session.user.name = token.name;
				session.user.email = token.email;
			}
			return session;
		},
		async jwt({ token, user, account }) {
			if (user) {
				token.id = user.id;
			}
			if (account) {
				token.accessToken = account.access_token;
			}
			return token;
		}
	},
	debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 