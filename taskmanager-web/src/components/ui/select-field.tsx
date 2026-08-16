'use client';

import { useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useClickOutside } from '@/hooks/use-click-outside';

export interface SelectFieldOption<T extends string> {
  value: T;
  label: string;
  leading?: React.ReactNode;
}

interface SelectFieldProps<T extends string> {
  label: string;
  value: T;
  options: SelectFieldOption<T>[];
  onChange: (v: T) => void;
  renderTrigger?: React.ReactNode;
}

export function SelectField<T extends string>({ label, value, options, onChange, renderTrigger }: SelectFieldProps<T>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));
  const safeOptions = options ?? [];
  const current = safeOptions.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-sm hover:bg-sidebar-active">
        {renderTrigger ?? (
          <span className="flex items-center gap-2 text-foreground">
            {current?.leading}
            {current?.label ?? `Select ${label}`}
          </span>
        )}
        <ChevronDown size={14} className="text-muted" />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 w-full max-h-64 overflow-y-auto rounded-xl border border-border bg-card p-1.5 shadow-lg">
          {safeOptions.length === 0 ? (
            <p className="px-2.5 py-2 text-xs text-muted">Nothing to select yet</p>
          ) : (
            safeOptions.map((opt) => (
              <button key={opt.value} onClick={() => { onChange(opt.value); setOpen(false); }} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-foreground hover:bg-sidebar-active">
                {opt.leading}
                <span className="flex-1 text-left">{opt.label}</span>
                {value === opt.value && <Check size={14} className="text-accent" />}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}