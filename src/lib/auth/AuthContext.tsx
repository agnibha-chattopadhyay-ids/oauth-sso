"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useApolloClient } from '@apollo/client';
import { createTokenStore } from './token';
import { getDapp, DAPP_IDS } from './dapps';
import { GET_USER } from '@/lib/graphql/auth.operations';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ 
  children, 
  dappId = process.env.NEXT_PUBLIC_DAPP_ID || DAPP_IDS.DEFAULT 
}: { 
  children: ReactNode; 
  dappId?: string;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const client = useApolloClient();
  const tokenStore = createTokenStore(dappId);

  useEffect(() => {
    // Validate dapp and check authentication on mount
    const dappConfig = getDapp(dappId);
    if (!dappConfig) {
      setError(new Error(`Invalid dapp ID: ${dappId}`));
      setLoading(false);
      return;
    }

    const token = tokenStore.getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    // Validate token and fetch user data
    client.query({
      query: GET_USER,
      context: {
        headers: {
          authorization: `Bearer ${token}`,
        },
      },
    }).then(({ data }) => {
      if (data?.me) {
        setUser(data.me);
      }
    }).catch(() => {
      tokenStore.removeToken();
    }).finally(() => {
      setLoading(false);
    });
  }, [dappId, client]);

  const login = (token: string) => {
    tokenStore.setToken(token);
    // No automatic user fetch - will be fetched when needed
  };

  const logout = () => {
    tokenStore.removeToken();
    setUser(null);
    client.resetStore();
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout }}>
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