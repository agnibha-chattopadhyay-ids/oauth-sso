"use client";

import { ApolloProvider } from '@apollo/client';
import { AuthProvider } from "@/lib/auth/AuthContext";
import { ThemeProvider } from "@/context/themeContext";
import { getApolloClient } from "@/lib/apollo/client";

export function Providers({ children }: { children: React.ReactNode }) {
  const dappId = process.env.NEXT_PUBLIC_DAPP_ID || 'default';
  const apolloClient = getApolloClient(dappId);

  return (
    <ApolloProvider client={apolloClient}>
      <AuthProvider dappId={dappId}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </AuthProvider>
    </ApolloProvider>
  );
} 