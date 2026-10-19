import React, { createContext, useContext, useMemo, useState } from 'react';
import {
  darkColors,
  fontSizes,
  lightColors,
  radius,
  spacing,
  type ThemeColors,
} from './theme';

type ThemeContextValue = {
  colors: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
  spacing: typeof spacing;
  radius: typeof radius;
  fontSizes: typeof fontSizes;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

type ThemeProviderProps = { children: React.ReactNode };

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [isDark, setIsDark] = useState(false);
  const toggleTheme = () => setIsDark((current) => !current);
  const colors = isDark ? darkColors : lightColors;
  const value = useMemo(
    () => ({ colors, isDark, toggleTheme, spacing, radius, fontSizes }),
    [colors, isDark],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider.');
  }
  return context;
}
