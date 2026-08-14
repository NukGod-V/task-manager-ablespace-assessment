'use client';

import * as React from 'react';
import type { CreateTaskInput } from '@/lib/api';

type CreateTaskHandler = (input: CreateTaskInput) => Promise<void>;

interface TaskActionsContextValue {
  createTaskHandler: CreateTaskHandler | null;
  setCreateTaskHandler: (fn: CreateTaskHandler | null) => void;
}

const TaskActionsContext = React.createContext<TaskActionsContextValue | undefined>(undefined);

// Bridges the Topbar (lives in the shared AppShell, no access to page
// state) with whichever page currently knows how to actually create a
// task. Only /tasks registers a handler right now — /projects has none,
// so the Add button there falls back to a "coming soon" notice instead
// of silently doing nothing.
export function TaskActionsProvider({ children }: { children: React.ReactNode }) {
  const [createTaskHandler, setCreateTaskHandlerState] = React.useState<CreateTaskHandler | null>(null);
  const setCreateTaskHandler = React.useCallback((fn: CreateTaskHandler | null) => {
    setCreateTaskHandlerState(() => fn);
  }, []);
  return (
    <TaskActionsContext.Provider value={{ createTaskHandler, setCreateTaskHandler }}>
      {children}
    </TaskActionsContext.Provider>
  );
}

export function useTaskActions() {
  const ctx = React.useContext(TaskActionsContext);
  if (!ctx) throw new Error('useTaskActions must be used within a TaskActionsProvider');
  return ctx;
}