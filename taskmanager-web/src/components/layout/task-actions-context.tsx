'use client';

import * as React from 'react';
import type { CreateTaskInput } from '@/lib/api';
import type { TaskStatus } from '@/types/task';

type CreateTaskHandler = (input: CreateTaskInput) => Promise<void>;
type OpenAddTaskFn = (defaultStatus?: TaskStatus) => void;

interface TaskActionsContextValue {
  createTaskHandler: CreateTaskHandler | null;
  setCreateTaskHandler: (fn: CreateTaskHandler | null) => void;
  // Bridges Board's per-column "+" buttons (no access to Topbar's modal
  // state) with Topbar (which owns the actual Add Task modal).
  openAddTaskModal: OpenAddTaskFn;
  registerOpenAddTaskModal: (fn: OpenAddTaskFn | null) => void;
}

const TaskActionsContext = React.createContext<TaskActionsContextValue | undefined>(undefined);

export function TaskActionsProvider({ children }: { children: React.ReactNode }) {
  const [createTaskHandler, setCreateTaskHandlerState] = React.useState<CreateTaskHandler | null>(null);
  const [openFn, setOpenFn] = React.useState<OpenAddTaskFn | null>(null);

  const setCreateTaskHandler = React.useCallback((fn: CreateTaskHandler | null) => {
    setCreateTaskHandlerState(() => fn);
  }, []);

  const registerOpenAddTaskModal = React.useCallback((fn: OpenAddTaskFn | null) => {
    setOpenFn(() => fn);
  }, []);

  const openAddTaskModal = React.useCallback<OpenAddTaskFn>(
    (defaultStatus) => openFn?.(defaultStatus),
    [openFn],
  );

  return (
    <TaskActionsContext.Provider
      value={{ createTaskHandler, setCreateTaskHandler, openAddTaskModal, registerOpenAddTaskModal }}
    >
      {children}
    </TaskActionsContext.Provider>
  );
}

export function useTaskActions() {
  const ctx = React.useContext(TaskActionsContext);
  if (!ctx) throw new Error('useTaskActions must be used within a TaskActionsProvider');
  return ctx;
}