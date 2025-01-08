I'll help you create a comprehensive README.md for your Next.js authentication project. Here's a detailed documentation:

```markdown:README.md
# Next.js Authentication Demo

A modern authentication system built with Next.js 14, MongoDB, Prisma, and NextAuth.js.

## Features

- 🔐 Authentication with NextAuth.js
- 🚀 Google OAuth Integration
- 👤 Custom Credentials Authentication
- 📝 User Registration
- 🔒 Protected Routes
- 🎨 Modern UI with Tailwind CSS
- 🔄 Type-safe with TypeScript
- 🗄️ MongoDB Database with Prisma ORM

## Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- MongoDB database
- Google OAuth credentials
- pnpm package manager (recommended)

## Environment Variables

Create a `.env.local` file in the root directory with:

```bash
# MongoDB Database URL
DATABASE_URL="your_mongodb_url"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_nextauth_secret"

# Google OAuth
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/next-auth-demo.git
cd next-auth-demo
```

2. Install dependencies:
```bash
pnpm install
```

3. Generate Prisma client:
```bash
pnpm prisma generate
```

4. Start the development server:
```bash
pnpm dev
```

## Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   └── dashboard/         # Protected dashboard
├── components/            # React components
│   ├── auth/             # Authentication components
│   └── ui/               # UI components
├── lib/                   # Utility functions
│   ├── actions/          # Server actions
│   └── validations/      # Form validations
└── middleware.ts         # Authentication middleware
```

## Authentication Flow

1. **Google OAuth**:
   - Click "Continue with Google"
   - Authorize the application
   - Redirected to dashboard

2. **Credentials**:
   - Register with email/password
   - Login with credentials
   - JWT-based session

## API Routes

- `/api/auth/[...nextauth]` - NextAuth.js authentication
- `/auth/login` - Login page
- `/auth/register` - Registration page
- `/dashboard` - Protected dashboard

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
```

This README provides a comprehensive overview of your authentication project, including setup instructions, features, project structure, and contribution guidelines. You can customize it further based on your specific needs or additional features.

The documentation references the following code blocks for implementation details:


```35:87:src/lib/auth.ts
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
```



```4:32:src/middleware.ts
export default withAuth(
	function middleware(req) {
		const isAuth = !!req.nextauth.token;
		const isAuthPage = req.nextUrl.pathname.startsWith("/auth");

		if (isAuthPage) {
			if (isAuth) {
				return NextResponse.redirect(new URL("/dashboard", req.url));
			}
			return null;
		}

		if (!isAuth) {
			let callbackUrl = req.nextUrl.pathname;
			if (req.nextUrl.search) {
				callbackUrl += req.nextUrl.search;
			}
			const encodedCallbackUrl = encodeURIComponent(callbackUrl);
			return NextResponse.redirect(
				new URL(`/auth/login?callbackUrl=${encodedCallbackUrl}`, req.url)
			);
		}
	},
	{
		callbacks: {
			authorized: () => true,
		},
	}
);
```



```106:131:src/components/auth/login-form.tsx
      <Button
        variant="outline"
        type="button"
        className="w-full"
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
      >
        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Continue with Google
      </Button>
```

