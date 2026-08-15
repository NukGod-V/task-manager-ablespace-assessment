'use client';

import * as React from 'react';
import { BOARD_FIELD_DEFAULTS, LIST_FIELD_DEFAULTS, type FieldVisibility, type TaskField } from '@/lib/task-fields';
import type { ViewMode } from './view-mode-context';

const STORAGE_KEY = 'visibleFields';

type FieldStore = Record<string, FieldVisibility>;

interface FieldsContextValue {
  getFields: (viewKey: string, mode: ViewMode) => FieldVisibility;
  toggleField: (viewKey: string, mode: ViewMode, field: TaskField) => void;
}

const FieldsContext = React.createContext<FieldsContextValue | undefined>(undefined);

function keyFor(viewKey: string, mode: ViewMode) {
  return `${viewKey}-${mode}`; // e.g. "tasks-board", "tasks-list" — matches figma-extraction's viewKey pattern
}

export function FieldsProvider({ children }: { children: React.ReactNode }) {
  const [store, setStore] = React.useState<FieldStore>({});
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setStore(JSON.parse(raw));
      } catch {
        // ignore malformed storage
      }
    }
    setMounted(true);
  }, []);

  const getFields = React.useCallback(
    (viewKey: string, mode: ViewMode): FieldVisibility => {
      const k = keyFor(viewKey, mode);
      if (mounted && store[k]) return store[k];
      return mode === 'board' ? BOARD_FIELD_DEFAULTS : LIST_FIELD_DEFAULTS;
    },
    [store, mounted],
  );

  const toggleField = React.useCallback((viewKey: string, mode: ViewMode, field: TaskField) => {
    setStore((prev) => {
      const k = keyFor(viewKey, mode);
      const current = prev[k] ?? (mode === 'board' ? BOARD_FIELD_DEFAULTS : LIST_FIELD_DEFAULTS);
      const next = { ...prev, [k]: { ...current, [field]: !current[field] } };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <FieldsContext.Provider value={{ getFields, toggleField }}>{children}</FieldsContext.Provider>
  );
}

export function useFields(viewKey: string, mode: ViewMode) {
  const ctx = React.useContext(FieldsContext);
  if (!ctx) throw new Error('useFields must be used within a FieldsProvider');
  return {
    fields: ctx.getFields(viewKey, mode),
    toggleField: (field: TaskField) => ctx.toggleField(viewKey, mode, field),
  };
}