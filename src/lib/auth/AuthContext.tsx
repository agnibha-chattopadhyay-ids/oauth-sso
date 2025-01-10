"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useApolloClient, useQuery } from '@apollo/client';
import { GET_USER } from '@/lib/graphql/auth.operations';
import { createTokenStore, type TokenStore, isTokenExpired } from './token';
import { clientRegistry } from './clients';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  login: (token: string, refreshToken?: string) => void;
  logout: () => void;
  tokenStore: TokenStore;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ 
  children, 
  clientId = process.env.NEXT_PUBLIC_CLIENT_ID || 'default' 
}: { 
  children: ReactNode; 
  clientId?: string;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const client = useApolloClient();
  const tokenStore = createTokenStore(clientId);

  // Validate client
  useEffect(() => {
    const clientConfig = clientRegistry.getClient(clientId);
    if (!clientConfig) {
      setError(new Error(`Invalid client ID: ${clientId}`));
      setLoading(false);
      return;
    }
  }, [clientId]);

  // Check token and fetch user data
  const token = tokenStore.getToken();
  const { data, error: queryError } = useQuery(GET_USER, {
    skip: !token || isTokenExpired(token),
  });

  useEffect(() => {
    if (queryError) {
      setError(queryError);
      if (queryError.message.includes('token')) {
        tokenStore.removeToken();
      }
    }
    setLoading(false);
  }, [queryError]);

  useEffect(() => {
    if (data?.me) {
      setUser(data.me);
      setError(null);
    }
    setLoading(false);
  }, [data]);

  const login = (token: string, refreshToken?: string) => {
    tokenStore.setToken(token);
    if (refreshToken) {
      tokenStore.setRefreshToken(refreshToken);
    }
    client.resetStore();
  };

  const logout = () => {
    tokenStore.removeToken();
    setUser(null);
    client.resetStore();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        tokenStore,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 