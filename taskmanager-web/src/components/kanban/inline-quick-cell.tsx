'use client';

import { useRef, useState } from 'react';
import { useClickOutside } from '@/hooks/use-click-outside';

export function InlineQuickCell({
  trigger,
  children,
  widthClass = 'w-48',
}: {
  trigger: React.ReactNode;
  children: (close: () => void) => React.ReactNode;
  widthClass?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));

  return (
    <div ref={ref} className="relative" onClick={(e) => e.stopPropagation()}>
      {/* This MUST be a div, not a button — several callers (e.g. the "+"
          assignee trigger in the task detail page) pass a real <button> as
          `trigger`, and HTML forbids a <button> inside another <button>. */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen((o) => !o); } }}
        className="flex cursor-pointer items-center"
      >
        {trigger}
      </div>
      {open && (
        <div className={`absolute left-0 top-full z-50 mt-1 ${widthClass} rounded-xl border border-border bg-card p-2 shadow-lg`}>
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}