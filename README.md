# Next.js SSO Interface

A flexible Single Sign-On (SSO) interface built with Next.js, designed to integrate with your existing GraphQL authentication server.

## Features

- 🔐 Authentication Interface
  - Email/Password form handling
  - Server-side Google OAuth flow
  - Extensible for more providers

- 🏢 Multi-Dapp Support
  - Dapp-specific configurations
  - Flexible redirect handling

- 🛡️ Security Features
  - Server-side OAuth verification
  - Rate limiting
  - CSRF protection
  - Token management

- 🎨 Modern UI/UX
  - Responsive design
  - Dark/Light mode support
  - Loading states
  - Toast notifications

## Prerequisites

- Node.js 18+
- GraphQL Authentication Server
- Google OAuth credentials
- pnpm package manager

## Getting Started

1. Install dependencies:
```bash
pnpm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

3. Run the development server:
```bash
pnpm dev
```

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   └── auth/              # Authentication pages
├── components/            # React components
│   ├── auth/             # Authentication components
│   └── ui/               # Shared UI components
├── lib/                   # Utilities and configurations
│   ├── auth/             # Auth context and config
│   ├── graphql/          # GraphQL operations
│   └── utils/            # Helper functions
└── middleware.ts         # Auth middleware
```

## Authentication Flow

1. User starts at `/auth/login`
2. Chooses authentication method
3. Completes authentication
4. Redirected based on dapp configuration

## Error Handling

The interface handles:
- Authentication failures
- Network errors
- OAuth flow errors
- Validation errors

