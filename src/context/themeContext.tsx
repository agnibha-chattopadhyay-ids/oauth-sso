"use client";

import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { getDapp } from '@/lib/auth/dapps';
import { setDappTheme } from '@/lib/utils';

interface ThemeContextType {
  getThemeConfig: (dappId?: string) => {
    backgroundColor: string;
    primaryColor: string;
    particleColor: string;
    foregroundColor: string;
    cardColor: string;
    cardForeground: string;
    popoverColor: string;
    popoverForeground: string;
    primaryForeground: string;
    secondaryColor: string;
    secondaryForeground: string;
    mutedColor: string;
    mutedForeground: string;
    accentColor: string;
    accentForeground: string;
    borderColor: string;
    inputColor: string;
    ringColor: string;
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
      foregroundColor: '#020817',
      cardColor: '#ffffff',
      cardForeground: '#020817',
      popoverColor: '#ffffff',
      popoverForeground: '#020817',
      primaryForeground: '#ffffff',
      secondaryColor: '#f1f5f9',
      secondaryForeground: '#0f172a',
      mutedColor: '#f1f5f9',
      mutedForeground: '#475569',
      accentColor: '#f1f5f9',
      accentForeground: '#0f172a',
      borderColor: '#e2e8f0',
      inputColor: 'rgba(0, 0, 0, 0.1)',
      ringColor: 'rgba(2, 132, 199, 0.5)',
      title: 'Authentication'
    };

    if (!dappId) {
      setDappTheme(defaultConfig);
      return defaultConfig;
    }

    const dappConfig = getDapp(dappId);
    if (!dappConfig?.theme) {
      setDappTheme(defaultConfig);
      return defaultConfig;
    }

    const config = {
      backgroundColor: dappConfig.theme.backgroundColor || defaultConfig.backgroundColor,
      primaryColor: dappConfig.theme.primaryColor || defaultConfig.primaryColor,
      particleColor: dappConfig.theme.particleColor || defaultConfig.particleColor,
      foregroundColor: dappConfig.theme.foregroundColor || defaultConfig.foregroundColor,
      cardColor: dappConfig.theme.cardColor || defaultConfig.cardColor,
      cardForeground: dappConfig.theme.cardForeground || defaultConfig.cardForeground,
      popoverColor: dappConfig.theme.popoverColor || defaultConfig.popoverColor,
      popoverForeground: dappConfig.theme.popoverForeground || defaultConfig.popoverForeground,
      primaryForeground: dappConfig.theme.primaryForeground || defaultConfig.primaryForeground,
      secondaryColor: dappConfig.theme.secondaryColor || defaultConfig.secondaryColor,
      secondaryForeground: dappConfig.theme.secondaryForeground || defaultConfig.secondaryForeground,
      mutedColor: dappConfig.theme.mutedColor || defaultConfig.mutedColor,
      mutedForeground: dappConfig.theme.mutedForeground || defaultConfig.mutedForeground,
      accentColor: dappConfig.theme.accentColor || defaultConfig.accentColor,
      accentForeground: dappConfig.theme.accentForeground || defaultConfig.accentForeground,
      borderColor: dappConfig.theme.borderColor || defaultConfig.borderColor,
      inputColor: dappConfig.theme.inputColor || defaultConfig.inputColor,
      ringColor: dappConfig.theme.ringColor || defaultConfig.ringColor,
      title: dappConfig.name || defaultConfig.title
    };

    setDappTheme(config);
    return config;
  };

  // Set default theme on mount
  useEffect(() => {
    const defaultConfig = getThemeConfig();
    setDappTheme(defaultConfig);
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