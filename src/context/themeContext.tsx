"use client";

import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { getDapp } from '@/lib/auth/dapps';
import { setDappTheme } from '@/lib/utils';

interface ThemeContextType {
  getThemeConfig: (dappId?: string) => {
    backgroundColor: string;
    primaryColor: string;
    particleColor: string;
    title: string;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const getThemeConfig = (dappId?: string) => {
    const defaultConfig = {
      backgroundColor: '#ffffff',
      primaryColor: '#0284c7',
      particleColor: '#000000',
      title: 'Authentication'
    };

    if (!dappId) return defaultConfig;

    const dappConfig = getDapp(dappId);
    if (!dappConfig?.theme) return defaultConfig;

    const config = {
      backgroundColor: dappConfig.theme.backgroundColor || defaultConfig.backgroundColor,
      primaryColor: dappConfig.theme.primaryColor || defaultConfig.primaryColor,
      particleColor: dappConfig.theme.particleColor || defaultConfig.particleColor,
      title: dappConfig.name || defaultConfig.title
    };

    // Set the theme CSS variables
    setDappTheme({
      backgroundColor: config.backgroundColor,
      primaryColor: config.primaryColor,
      particleColor: config.particleColor
    });

    return config;
  };

  // Set default theme on mount
  useEffect(() => {
    getThemeConfig();
  }, []);

  return (
    <ThemeContext.Provider value={{ getThemeConfig }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 