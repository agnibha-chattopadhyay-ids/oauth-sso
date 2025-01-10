# Next.js SSO Interface

A flexible Single Sign-On (SSO) interface built with Next.js, designed to integrate with your existing GraphQL authentication server. This interface handles client-side authentication flows, token management, and user experience while delegating actual authentication to your GraphQL server.

## Features

- 🔐 Authentication Interface
  - Email/Password form handling
  - Server-side Google OAuth flow
  - Extensible for more providers

- 🏢 Multi-Client Support
  - Client-specific configurations
  - Custom branding and theming
  - Flexible redirect handling

- 🛡️ Security Features
  - Server-side OAuth verification
  - Rate limiting
  - CSRF protection
  - Token management
  - Error handling

- 🎨 Modern UI/UX
  - Animated transitions
  - Client-specific theming
  - Responsive design
  - Dark/Light mode support
  - Loading states
  - Toast notifications

## Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- GraphQL Authentication Server
- Google OAuth credentials (configured on server)
- pnpm package manager

## Environment Variables

Create a `.env.local` file in the root directory with:

```bash
# GraphQL Authentication Server
NEXT_PUBLIC_GRAPHQL_URI="https://your-auth-server.com/graphql"

# Application Configuration
NEXT_PUBLIC_CLIENT_ID="default"

# Optional: Default redirect URL
NEXT_PUBLIC_DEFAULT_REDIRECT_URL="http://localhost:3000/dashboard"
```

## Required GraphQL Endpoints

Your authentication server should implement these GraphQL operations:

```graphql
# Authentication Mutations
mutation Login($email: String!, $password: String!, $clientId: String!) {
  login(email: $email, password: $password, clientId: $clientId) {
    token
    refreshToken
    user {
      id
      email
      name
    }
  }
}

mutation GoogleAuthCallback($code: String!, $clientId: String!) {
  googleAuthCallback(code: $code, clientId: $clientId) {
    token
    refreshToken
    user {
      id
      email
      name
    }
  }
}

# Queries
query GetGoogleAuthUrl($clientId: String!, $redirectUri: String) {
  googleAuthUrl(clientId: $clientId, redirectUri: $redirectUri)
}

query GetUser {
  me {
    id
    email
    name
  }
}
```

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── auth/              # Authentication pages
│   │   ├── login/         # Login options
│   │   │   └── credentials/  # Email/password login
│   │   └── google/        # Google OAuth handling
│   │       └── callback/  # OAuth callback
├── components/            # React components
│   ├── auth/             # Authentication components
│   │   ├── login-form.tsx      # Login options
│   │   └── credentials-form.tsx # Email form
│   └── ui/               # Shared UI components
├── lib/                   # Utilities and configurations
│   ├── auth/             # Auth context and client config
│   ├── graphql/          # GraphQL operations
│   └── utils/            # Helper functions
└── middleware.ts         # Auth middleware and security
```

## Authentication Flow

### 1. Entry Point
- User starts at `/auth/login`
- Client ID and redirect URI are handled as query parameters
- Default client is used if none specified

### 2. Authentication Methods

#### Email/Password Flow:
1. User clicks "Continue with Email"
2. Redirected to `/auth/login/credentials` with client parameters
3. Enters credentials in the form
4. Server validates and returns tokens
5. Interface handles redirect with tokens

#### Google OAuth Flow (Server-Side):
1. User clicks "Continue with Google"
2. Interface requests OAuth URL from GraphQL server
3. Server generates OAuth URL with proper scopes and state
4. User is redirected to Google consent screen
5. Google redirects back to `/auth/google/callback`
6. Server validates code and returns tokens
7. Interface handles final redirect

### 3. Security Considerations

- OAuth flow is handled server-side to prevent token exposure
- Client verification happens on the server
- State parameter includes client ID for verification
- Tokens are stored securely with HTTP-only cookies
- All sensitive operations happen server-side

## Client Configuration

Configure clients in `src/lib/auth/clients.ts`:

```typescript
clientRegistry.registerClient({
  // Basic Information
  clientId: "your-client-id",
  name: "Your Application",
  description: "Application description",
  applicationUrl: "https://your-app.com",
  
  // Authentication Configuration
  authMethods: ["credentials", "google"],
  allowedRedirectUrls: ["https://your-app.com/callback"],
  
  // Interface Branding
  theme: {
    primaryColor: "#0070f3",
    accentColor: "#00a3ff",
  }
});
```

## Integration Steps

1. Configure your GraphQL server with OAuth credentials
2. Register your client in the interface
3. Implement the callback handling in your application
4. Test the flow with your client ID

## Error Handling

The interface provides user-friendly error messages and handles:
- Invalid client configurations
- Authentication failures
- Network errors
- OAuth flow errors
- Server-side validation errors

