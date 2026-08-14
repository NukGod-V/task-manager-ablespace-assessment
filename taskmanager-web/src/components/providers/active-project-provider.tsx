'use client';

import * as React from 'react';

export interface ActiveProjectRef {
  id: string;
  name: string;
}

const STORAGE_KEY = 'activeProject';

interface ActiveProjectContextValue {
  activeProject: ActiveProjectRef | null;
  setActiveProject: (project: ActiveProjectRef) => void;
}

const ActiveProjectContext = React.createContext<ActiveProjectContextValue | undefined>(undefined);

export function ActiveProjectProvider({ children }: { children: React.ReactNode }) {
  const [activeProject, setActiveProjectState] = React.useState<ActiveProjectRef | null>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setActiveProjectState(JSON.parse(stored));
      } catch {
        // ignore malformed storage
      }
    }
    setMounted(true);
  }, []);

  const setActiveProject = React.useCallback((project: ActiveProjectRef) => {
    setActiveProjectState(project);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
  }, []);

  return (
    <ActiveProjectContext.Provider value={{ activeProject: mounted ? activeProject : null, setActiveProject }}>
      {children}
    </ActiveProjectContext.Provider>
  );
}

export function useActiveProject() {
  const ctx = React.useContext(ActiveProjectContext);
  if (!ctx) throw new Error('useActiveProject must be used within an ActiveProjectProvider');
  return ctx;
}