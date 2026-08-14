'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Search, SlidersHorizontal, Filter, Plus, PanelLeft, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useClickOutside } from '@/hooks/use-click-outside';
import { useSidebar } from './sidebar-context';

function getPageMeta(pathname: string) {
  if (pathname.startsWith('/projects')) return { title: 'Projects', breadcrumb: ['Projects'] };
  return { title: 'Tasks', breadcrumb: ['Tasks'] };
}

// Same checklist items back both Fields and Filter per your instruction —
// no actual filtering/visibility logic wired yet, just the UI per §2.5.
const FIELD_ITEMS = ['Priority', 'Members', 'Due Date', 'Labels', 'Status', 'Reporter'];
const FILTER_ITEMS = ['Status', 'Priority', 'Members', 'Due Date', 'Teams', 'Labels', 'Reporter'];

function ChecklistPopover({
  title,
  items,
  onClose,
}: {
  title: string;
  items: string[];
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, onClose);
  const [checked, setChecked] = useState<Record<string, boolean>>(
    Object.fromEntries(items.map((i) => [i, true])),
  );

  return (
    <div ref={ref} className="absolute right-0 top-full z-50 mt-1 w-52 rounded-xl border border-border bg-card p-1.5 shadow-lg">
      <p className="px-2.5 py-1.5 text-xs font-medium text-muted">{title}</p>
      {items.map((item) => (
        <label
          key={item}
          className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-foreground hover:bg-sidebar-active"
        >
          <input
            type="checkbox"
            checked={checked[item]}
            onChange={() => setChecked((prev) => ({ ...prev, [item]: !prev[item] }))}
            className="h-3.5 w-3.5 accent-accent"
          />
          {item}
        </label>
      ))}
    </div>
  );
}

function AddTaskModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-[420px] rounded-xl border border-border bg-card p-6 shadow-lg"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">New Task</h2>
          <button onClick={onClose} className="text-muted hover:text-foreground" aria-label="Close">
            <X size={16} />
          </button>
        </div>

        {/* Placeholder only — real create-task form/API call comes once
            Phase 4's backend Project/Task fields are wired to the frontend. */}
        <input
          placeholder="Task title..."
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted"
        />

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-full border border-border px-4 py-2 text-sm text-foreground hover:bg-sidebar-active">
            Cancel
          </button>
          <button onClick={onClose} className="rounded-full bg-cta-primary px-4 py-2 text-sm text-cta-primary-foreground">
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

export function Topbar() {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebar();
  const { title, breadcrumb } = getPageMeta(pathname);

  const [searchOpen, setSearchOpen] = useState(false);
  const [fieldsOpen, setFieldsOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setSearchOpen(true);
        requestAnimationFrame(() => searchRef.current?.focus());
      }
      if (e.key === 'Escape') setSearchOpen(false);
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header className="flex h-14 items-center gap-3 border-b border-border bg-background px-4">
        <button onClick={toggle} className="rounded-lg p-1.5 hover:bg-sidebar-active" aria-label={collapsed ? 'Show sidebar' : 'Hide sidebar'}>
          <PanelLeft size={18} className="text-muted" />
        </button>

        <div className="flex-1">
          {searchOpen ? (
            <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5">
              <Search size={16} className="text-muted" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search..."
                onBlur={() => setSearchOpen(false)}
                className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted"
              />
              <kbd className="rounded border border-border px-1.5 py-0.5 text-[10px] text-muted">⌘F</kbd>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-sm">
              {breadcrumb.map((crumb, i) => (
                <span key={crumb} className="flex items-center gap-1">
                  {i > 0 && <span className="text-muted">/</span>}
                  <span className={cn(i === breadcrumb.length - 1 ? 'font-semibold text-foreground' : 'text-muted')}>{crumb}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {!searchOpen && (
          <button onClick={() => setSearchOpen(true)} className="rounded-lg p-1.5 hover:bg-sidebar-active" aria-label="Search">
            <Search size={16} className="text-muted" />
          </button>
        )}

        <div className="relative">
          <button
            onClick={() => setFieldsOpen((o) => !o)}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-foreground hover:bg-sidebar-active"
          >
            <SlidersHorizontal size={14} />
            Fields
          </button>
          {fieldsOpen && <ChecklistPopover title="Visible Fields" items={FIELD_ITEMS} onClose={() => setFieldsOpen(false)} />}
        </div>

        <div className="relative">
          <button
            onClick={() => setFilterOpen((o) => !o)}
            className="rounded-lg border border-border p-1.5 text-foreground hover:bg-sidebar-active"
            aria-label="Filter"
          >
            <Filter size={16} />
          </button>
          {filterOpen && <ChecklistPopover title="Filter By" items={FILTER_ITEMS} onClose={() => setFilterOpen(false)} />}
        </div>

        <button
          onClick={() => setAddTaskOpen(true)}
          className="flex items-center gap-1 rounded-full bg-cta-primary px-4 py-1.5 text-sm font-medium text-cta-primary-foreground"
        >
          <Plus size={14} />
          Add {title === 'Projects' ? 'Project' : 'Task'}
        </button>
      </header>

      {addTaskOpen && <AddTaskModal onClose={() => setAddTaskOpen(false)} />}
    </>
  );
}