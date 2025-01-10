"use client";

import { ApolloProvider } from '@apollo/client';
import { AuthProvider } from "@/lib/auth/AuthContext";
import { getApolloClient } from "@/lib/apollo/client";

export function Providers({ children }: { children: React.ReactNode }) {
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID || 'default';
  const apolloClient = getApolloClient(clientId);

  return (
    <ApolloProvider client={apolloClient}>
      <AuthProvider clientId={clientId}>
        {children}
      </AuthProvider>
    </ApolloProvider>
  );
} 