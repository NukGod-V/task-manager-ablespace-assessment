'use client';

import * as React from 'react';

export type ViewMode = 'board' | 'list';

// Keyed by page (viewKey), matching the spec's "tracked per page" note —
// Tasks and Projects will each get their own List/Board state, not one
// shared toggle.
interface ViewModeContextValue {
  modes: Record<string, ViewMode>;
  setMode: (key: string, mode: ViewMode) => void;
}

const ViewModeContext = React.createContext<ViewModeContextValue | undefined>(undefined);

export function ViewModeProvider({ children }: { children: React.ReactNode }) {
  const [modes, setModes] = React.useState<Record<string, ViewMode>>({});
  const setMode = React.useCallback((key: string, mode: ViewMode) => {
    setModes((prev) => ({ ...prev, [key]: mode }));
  }, []);
  return <ViewModeContext.Provider value={{ modes, setMode }}>{children}</ViewModeContext.Provider>;
}

export function useViewMode(viewKey: string): [ViewMode, (mode: ViewMode) => void] {
  const ctx = React.useContext(ViewModeContext);
  if (!ctx) throw new Error('useViewMode must be used within a ViewModeProvider');
  const mode = ctx.modes[viewKey] ?? 'board';
  const setMode = React.useCallback((m: ViewMode) => ctx.setMode(viewKey, m), [ctx, viewKey]);
  return [mode, setMode];
}