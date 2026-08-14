'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  Search, SlidersHorizontal, Filter, Plus, PanelLeft, X, List, LayoutGrid,
  ChevronRight, Check, CircleDot, Users, UsersRound, UserCircle, CalendarDays, Tag,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useClickOutside } from '@/hooks/use-click-outside';
import { useSidebar } from './sidebar-context';
import { useViewMode } from './view-mode-context';
import { useTaskActions } from './task-actions-context';
import type { TaskStatus, TaskPriority } from '@/types/task';

function getPageMeta(pathname: string) {
  if (pathname.startsWith('/projects')) return { title: 'Projects', breadcrumb: ['Projects'], viewKey: 'projects' };
  return { title: 'Tasks', breadcrumb: ['Tasks'], viewKey: 'tasks' };
}

// --- Fields popover: List/Board toggle lives INSIDE it, per §2.4 ----------

function FieldsPopover({ viewKey, onClose }: { viewKey: string; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, onClose);
  const [viewMode, setViewMode] = useViewMode(viewKey);

  const defaults =
    viewMode === 'list'
      ? { Priority: true, Members: true, 'Due Date': true, Labels: false, Status: false, Reporter: false }
      : { Priority: true, Members: true, 'Due Date': true, Labels: true, Status: false, Reporter: false };

  const [checked, setChecked] = useState(defaults);

  useEffect(() => {
    setChecked(defaults);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  return (
    <div ref={ref} className="absolute right-0 top-full z-50 mt-1 w-56 rounded-xl border border-border bg-card p-1.5 shadow-lg">
      <div className="mb-1.5 flex rounded-lg bg-sidebar p-1">
        <button
          onClick={() => setViewMode('list')}
          className={cn(
            'flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium',
            viewMode === 'list' ? 'bg-card text-foreground shadow-sm' : 'text-muted',
          )}
        >
          <List size={13} /> List
        </button>
        <button
          onClick={() => setViewMode('board')}
          className={cn(
            'flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium',
            viewMode === 'board' ? 'bg-card text-foreground shadow-sm' : 'text-muted',
          )}
        >
          <LayoutGrid size={13} /> Board
        </button>
      </div>

      {Object.keys(checked).map((field) => (
        <label key={field} className="flex items-center justify-between rounded-lg px-2.5 py-2 text-sm text-foreground hover:bg-sidebar-active">
          {field}
          <input
            type="checkbox"
            checked={checked[field as keyof typeof checked]}
            onChange={() => setChecked((prev) => ({ ...prev, [field]: !prev[field as keyof typeof prev] }))}
            className="h-3.5 w-3.5 accent-accent"
          />
        </label>
      ))}
    </div>
  );
}

// --- Filter popover: nested category -> value flyout ----------------------

const FILTER_CATEGORIES = [
  { key: 'status', label: 'Status', icon: CircleDot, values: ['Backlog', 'To Do', 'Doing', 'Completed', 'On Hold'] },
  { key: 'priority', label: 'Priority', icon: SlidersHorizontal, values: ['No Priority', 'Urgent', 'High', 'Medium', 'Low'] },
  { key: 'members', label: 'Members', icon: Users, values: ['Alex Chen', 'Priya Rao', 'Sam Torres', 'Nina Patel'] },
  { key: 'dueDate', label: 'Due Date', icon: CalendarDays, values: ['Overdue', 'Due Today', 'Due This Week', 'No Date'] },
  { key: 'teams', label: 'Teams', icon: UsersRound, values: ['No teams yet'] },
  { key: 'labels', label: 'Labels', icon: Tag, values: ['Documentation', 'Development', 'Design', 'Deployment', 'Research', 'Testing'] },
  { key: 'reporter', label: 'Reporter', icon: UserCircle, values: ['Alex Chen', 'Priya Rao', 'Sam Torres', 'Nina Patel'] },
];

function FilterPopover({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, onClose);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selections, setSelections] = useState<Record<string, string[]>>({});

  function toggleValue(category: string, value: string) {
    setSelections((prev) => {
      const current = prev[category] ?? [];
      const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
      return { ...prev, [category]: next };
    });
  }

  return (
    <div ref={ref} className="absolute right-0 top-full z-50 mt-1 w-52 rounded-xl border border-border bg-card p-1.5 shadow-lg">
      {FILTER_CATEGORIES.map((cat) => {
        const Icon = cat.icon;
        const active = activeCategory === cat.key;
        const count = selections[cat.key]?.length ?? 0;
        return (
          <div key={cat.key} className="relative" onMouseEnter={() => setActiveCategory(cat.key)} onMouseLeave={() => setActiveCategory(null)}>
            <button
              onClick={() => setActiveCategory(active ? null : cat.key)}
              className={cn('flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-foreground', active ? 'bg-sidebar-active' : 'hover:bg-sidebar-active')}
            >
              <Icon size={14} className="text-muted" />
              <span className="flex-1 text-left">{cat.label}</span>
              {count > 0 && <span className="text-xs text-muted">{count}</span>}
              <ChevronRight size={14} className="text-muted" />
            </button>

            {active && (
              <div className="absolute right-full top-0 z-50 mr-1 w-48 rounded-xl border border-border bg-card p-1.5 shadow-lg">
                {cat.values.map((val) => {
                  const selected = selections[cat.key]?.includes(val);
                  return (
                    <button
                      key={val}
                      onClick={() => toggleValue(cat.key, val)}
                      className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-sm text-foreground hover:bg-sidebar-active"
                    >
                      {val}
                      {selected && <Check size={14} className="text-accent" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// --- Add Task modal ---------------------------------------------------

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'todo', label: 'To Do' },
  { value: 'doing', label: 'Doing' },
  { value: 'completed', label: 'Completed' },
  { value: 'on_hold', label: 'On Hold' },
];

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: 'no_priority', label: 'No Priority' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

// defaultStatus is now an actual parameter of this function — this is the
// fix for the ReferenceError. It was used on line 171 before but never
// declared here.
function AddTaskModal({ onClose, defaultStatus }: { onClose: () => void; defaultStatus?: TaskStatus }) {
  const { createTaskHandler } = useTaskActions();
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<TaskStatus>(defaultStatus ?? 'todo');
  const [priority, setPriority] = useState<TaskPriority>('no_priority');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    if (!createTaskHandler) {
      setError('Task creation isn\u2019t available right now — try reopening from the Tasks page.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await createTaskHandler({ title: title.trim(), status, priority });
      onClose();
    } catch {
      setError('Could not create the task. Is the API running?');
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-[420px] rounded-xl border border-border bg-card p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">New Task</h2>
          <button onClick={onClose} className="text-muted hover:text-foreground" aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title..."
          autoFocus
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted"
        />

        <div className="mt-3 flex gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none"
          >
            {PRIORITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {error && <p className="mt-3 text-xs text-destructive">{error}</p>}

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-full border border-border px-4 py-2 text-sm text-foreground hover:bg-sidebar-active">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="rounded-full bg-cta-primary px-4 py-2 text-sm text-cta-primary-foreground disabled:opacity-60"
          >
            {submitting ? 'Creating…' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Topbar --------------------------------------------------------------

export function Topbar() {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebar();
  const { title, breadcrumb, viewKey } = getPageMeta(pathname);
  const { openAddTaskModal, registerOpenAddTaskModal } = useTaskActions();

  const [searchOpen, setSearchOpen] = useState(false);
  const [fieldsOpen, setFieldsOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [prefillStatus, setPrefillStatus] = useState<TaskStatus | undefined>(undefined);
  const searchRef = useRef<HTMLInputElement>(null);

  // Lets Board's per-column "+" buttons trigger THIS modal with a status
  // pre-selected, since Board has no direct access to Topbar's state.
  useEffect(() => {
    registerOpenAddTaskModal((status) => {
      setPrefillStatus(status);
      setAddTaskOpen(true);
    });
    return () => registerOpenAddTaskModal(null);
  }, [registerOpenAddTaskModal]);

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
          <button onClick={() => setFieldsOpen((o) => !o)} className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-foreground hover:bg-sidebar-active">
            <SlidersHorizontal size={14} />
            Fields
          </button>
          {fieldsOpen && <FieldsPopover viewKey={viewKey} onClose={() => setFieldsOpen(false)} />}
        </div>

        <div className="relative">
          <button onClick={() => setFilterOpen((o) => !o)} className="rounded-lg border border-border p-1.5 text-foreground hover:bg-sidebar-active" aria-label="Filter">
            <Filter size={16} />
          </button>
          {filterOpen && <FilterPopover onClose={() => setFilterOpen(false)} />}
        </div>

        <button
          onClick={() => {
            setPrefillStatus(undefined); // generic Add Task — no column context
            setAddTaskOpen(true);
          }}
          className="flex items-center gap-1 rounded-full bg-cta-primary px-4 py-1.5 text-sm font-medium text-cta-primary-foreground"
        >
          <Plus size={14} />
          Add {title === 'Projects' ? 'Project' : 'Task'}
        </button>
      </header>

      {addTaskOpen && (
        <AddTaskModal
          onClose={() => setAddTaskOpen(false)}
          defaultStatus={prefillStatus}
        />
      )}
    </>
  );
}