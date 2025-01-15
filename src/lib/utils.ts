import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function setDappTheme(theme: {
  primaryColor?: string;
  backgroundColor?: string;
  particleColor?: string;
  foregroundColor?: string;
  cardColor?: string;
  cardForeground?: string;
  popoverColor?: string;
  popoverForeground?: string;
  primaryForeground?: string;
  secondaryColor?: string;
  secondaryForeground?: string;
  mutedColor?: string;
  mutedForeground?: string;
  accentColor?: string;
  accentForeground?: string;
  borderColor?: string;
  inputColor?: string;
  ringColor?: string;
}) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  // Set all theme variables
  if (theme.primaryColor) {
    root.style.setProperty('--dapp-primary-color', theme.primaryColor);
  }
  if (theme.backgroundColor) {
    root.style.setProperty('--dapp-background-color', theme.backgroundColor);
  }
  if (theme.particleColor) {
    root.style.setProperty('--dapp-particle-color', theme.particleColor);
  }
  if (theme.foregroundColor) {
    root.style.setProperty('--dapp-foreground-color', theme.foregroundColor);
  }
  if (theme.cardColor) {
    root.style.setProperty('--dapp-card-color', theme.cardColor);
  }
  if (theme.cardForeground) {
    root.style.setProperty('--dapp-card-foreground-color', theme.cardForeground);
  }
  if (theme.popoverColor) {
    root.style.setProperty('--dapp-popover-color', theme.popoverColor);
  }
  if (theme.popoverForeground) {
    root.style.setProperty('--dapp-popover-foreground-color', theme.popoverForeground);
  }
  if (theme.primaryForeground) {
    root.style.setProperty('--dapp-primary-foreground-color', theme.primaryForeground);
  }
  if (theme.secondaryColor) {
    root.style.setProperty('--dapp-secondary-color', theme.secondaryColor);
  }
  if (theme.secondaryForeground) {
    root.style.setProperty('--dapp-secondary-foreground-color', theme.secondaryForeground);
  }
  if (theme.mutedColor) {
    root.style.setProperty('--dapp-muted-color', theme.mutedColor);
  }
  if (theme.mutedForeground) {
    root.style.setProperty('--dapp-muted-foreground-color', theme.mutedForeground);
  }
  if (theme.accentColor) {
    root.style.setProperty('--dapp-accent-color', theme.accentColor);
  }
  if (theme.accentForeground) {
    root.style.setProperty('--dapp-accent-foreground-color', theme.accentForeground);
  }
  if (theme.borderColor) {
    root.style.setProperty('--dapp-border-color', theme.borderColor);
  }
  if (theme.inputColor) {
    root.style.setProperty('--dapp-input-color', theme.inputColor);
  }
  if (theme.ringColor) {
    root.style.setProperty('--dapp-ring-color', theme.ringColor);
  }
}
