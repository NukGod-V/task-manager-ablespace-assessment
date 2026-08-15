'use client';

import * as React from 'react';

export interface ActiveProjectRef {
  id: string;
  name: string;
}

import { ACTIVE_PROJECT_STORAGE_KEY } from '@/lib/storage-keys';

interface ActiveProjectContextValue {
  activeProject: ActiveProjectRef | null;
  setActiveProject: (project: ActiveProjectRef) => void;
  hydrated: boolean; // NEW — lets consumers wait instead of racing ahead
}

const ActiveProjectContext = React.createContext<ActiveProjectContextValue | undefined>(undefined);

export function ActiveProjectProvider({ children }: { children: React.ReactNode }) {
  const [activeProject, setActiveProjectState] = React.useState<ActiveProjectRef | null>(null);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    const stored = window.localStorage.getItem(ACTIVE_PROJECT_STORAGE_KEY);
    if (stored) {
      try {
        setActiveProjectState(JSON.parse(stored));
      } catch {
        // ignore malformed storage
      }
    }
    setHydrated(true);
  }, []);

  const setActiveProject = React.useCallback((project: ActiveProjectRef) => {
    setActiveProjectState(project);
    window.localStorage.setItem(ACTIVE_PROJECT_STORAGE_KEY, JSON.stringify(project));
  }, []);

  return (
    <ActiveProjectContext.Provider value={{ activeProject, setActiveProject, hydrated }}>
      {children}
    </ActiveProjectContext.Provider>
  );
}

export function useActiveProject() {
  const ctx = React.useContext(ActiveProjectContext);
  if (!ctx) throw new Error('useActiveProject must be used within an ActiveProjectProvider');
  return ctx;
}