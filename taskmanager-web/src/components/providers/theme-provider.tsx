'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ThemeProviderProps } from 'next-themes';

// ---- Axis 1: Light / Dark, delegated entirely to next-themes ----
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

// ---- Axis 2: Color Mode (accent), a lightweight custom provider ----
// Kept separate from next-themes because nesting two of its providers
// would collide on the same context — this stays independent and simple.
export type ColorMode = 'amber' | 'blue' | 'pink' | 'rose' | 'emerald' | 'black';

const COLOR_MODE_STORAGE_KEY = 'color-mode';
const DEFAULT_COLOR_MODE: ColorMode = 'blue'; // matches Figma's checked/active swatch

interface ColorModeContextValue {
  colorMode: ColorMode;
  setColorMode: (mode: ColorMode) => void;
}

const ColorModeContext = React.createContext<ColorModeContextValue | undefined>(
  undefined,
);

export function ColorModeProvider({ children }: { children: React.ReactNode }) {
  const [colorMode, setColorModeState] = React.useState<ColorMode>(DEFAULT_COLOR_MODE);
  const [mounted, setMounted] = React.useState(false);

  // Read persisted value only after mount to avoid SSR/client mismatch.
  React.useEffect(() => {
    const stored = window.localStorage.getItem(COLOR_MODE_STORAGE_KEY) as ColorMode | null;
    if (stored) setColorModeState(stored);
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute('data-color-mode', colorMode);
    window.localStorage.setItem(COLOR_MODE_STORAGE_KEY, colorMode);
  }, [colorMode, mounted]);

  const setColorMode = React.useCallback((mode: ColorMode) => {
    setColorModeState(mode);
  }, []);

  return (
    <ColorModeContext.Provider value={{ colorMode, setColorMode }}>
      {children}
    </ColorModeContext.Provider>
  );
}

export function useColorMode() {
  const ctx = React.useContext(ColorModeContext);
  if (!ctx) {
    throw new Error('useColorMode must be used within a ColorModeProvider');
  }
  return ctx;
}