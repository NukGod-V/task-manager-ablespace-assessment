'use client';
import * as React from 'react';

export interface FilterOptions { members: { id: string; username: string }[]; labels: string[]; }

interface FilterContextValue {
  selections: Record<string, string[]>;
  toggle: (category: string, value: string) => void;
  clear: () => void;
  activeCount: number;
  options: FilterOptions;
  setOptions: (opts: FilterOptions) => void;
}

const FilterContext = React.createContext<FilterContextValue | undefined>(undefined);

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [selections, setSelections] = React.useState<Record<string, string[]>>({});
  const [options, setOptionsState] = React.useState<FilterOptions>({ members: [], labels: [] });

  const toggle = React.useCallback((category: string, value: string) => {
    setSelections((prev) => {
      const current = prev[category] ?? [];
      const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
      return { ...prev, [category]: next };
    });
  }, []);
  const clear = React.useCallback(() => setSelections({}), []);
  const setOptions = React.useCallback((opts: FilterOptions) => setOptionsState(opts), []);
  const activeCount = Object.values(selections).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <FilterContext.Provider value={{ selections, toggle, clear, activeCount, options, setOptions }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const ctx = React.useContext(FilterContext);
  if (!ctx) throw new Error('useFilters must be used within a FilterProvider');
  return ctx;
}