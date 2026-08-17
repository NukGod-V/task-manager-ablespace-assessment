'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  Search, SlidersHorizontal, Filter, Plus, PanelLeft, List, LayoutGrid,
  ChevronRight, Check, CircleDot, Users, UsersRound, UserCircle, CalendarDays, Tag,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useClickOutside } from '@/hooks/use-click-outside';
import { useSidebar } from './sidebar-context';
import { useViewMode } from './view-mode-context';
import { useFields } from './fields-context';
import { useTaskActions } from './task-actions-context';
import { AddTaskPanel } from '@/components/kanban/add-task-panel';
import { TASK_FIELDS } from '@/lib/task-fields';
import type { TaskStatus } from '@/types/task';
import { useFilters } from './filter-context';
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from '@/lib/task-options';


function getPageMeta(pathname: string) {
  if (pathname.startsWith('/projects')) return { title: 'Projects', breadcrumb: ['Projects'], viewKey: 'projects' };
  return { title: 'Tasks', breadcrumb: ['Tasks'], viewKey: 'tasks' };
}

// Fields now reads/writes REAL shared state via useFields, instead of a
// local checked object that reset every time the popover closed.
function FieldsPopover({ viewKey, onClose }: { viewKey: string; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, onClose);
  const [viewMode, setViewMode] = useViewMode(viewKey);
  const { fields, toggleField } = useFields(viewKey, viewMode);

  return (
    <div ref={ref} className="absolute right-0 top-full z-50 mt-1 w-56 rounded-xl border border-border bg-card p-1.5 shadow-lg">
      <div className="mb-1.5 flex rounded-lg bg-sidebar p-1">
        <button
          onClick={() => setViewMode('list')}
          className={cn('flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium', viewMode === 'list' ? 'bg-card text-foreground shadow-sm' : 'text-muted')}
        >
          <List size={13} /> List
        </button>
        <button
          onClick={() => setViewMode('board')}
          className={cn('flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium', viewMode === 'board' ? 'bg-card text-foreground shadow-sm' : 'text-muted')}
        >
          <LayoutGrid size={13} /> Board
        </button>
      </div>

      {TASK_FIELDS.map((field) => (
        <label key={field} className="flex items-center justify-between rounded-lg px-2.5 py-2 text-sm text-foreground hover:bg-sidebar-active">
          {field}
          <input
            type="checkbox"
            checked={fields[field]}
            onChange={() => toggleField(field)}
            className="h-3.5 w-3.5 accent-accent"
          />
        </label>
      ))}
    </div>
  );
}


function FilterPopover({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, onClose);
  const { selections, toggle, clear, activeCount, options } = useFilters();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Teams intentionally omitted — no Team entity exists anywhere in the
  // schema, so a filter for it would either be fake or permanently empty.
  const categories = [
    { key: 'status', label: 'Status', icon: CircleDot, values: STATUS_OPTIONS.map((o) => o.label) },
    { key: 'priority', label: 'Priority', icon: SlidersHorizontal, values: PRIORITY_OPTIONS.map((o) => o.label) },
    { key: 'members', label: 'Members', icon: Users, values: options.members.map((m) => m.username), idFor: (label: string) => options.members.find((m) => m.username === label)?.id },
    { key: 'dueDate', label: 'Due Date', icon: CalendarDays, values: ['Overdue', 'Due Today', 'Due This Week', 'No Date'] },
    { key: 'labels', label: 'Labels', icon: Tag, values: options.labels },
    { key: 'reporter', label: 'Reporter', icon: UserCircle, values: options.members.map((m) => m.username), idFor: (label: string) => options.members.find((m) => m.username === label)?.id },
  ];

  // Status/Priority use their internal enum VALUE for matching (task.status
  // is 'todo', not 'To Do'), everything else stores the display value/id directly.
  function valueForToggle(categoryKey: string, label: string): string {
    if (categoryKey === 'status') return STATUS_OPTIONS.find((o) => o.label === label)?.value ?? label;
    if (categoryKey === 'priority') return PRIORITY_OPTIONS.find((o) => o.label === label)?.value ?? label;
    const cat = categories.find((c) => c.key === categoryKey);
    return cat?.idFor?.(label) ?? label;
  }

  return (
    <div ref={ref} className="absolute right-0 top-full z-50 mt-1 w-52 rounded-xl border border-border bg-card p-1.5 shadow-lg">
      {activeCount > 0 && (
        <button onClick={clear} className="mb-1 flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-accent hover:bg-sidebar-active">
          Clear all filters <span>{activeCount}</span>
        </button>
      )}
      {categories.map((cat) => {
        const Icon = cat.icon;
        const active = activeCategory === cat.key;
        const count = selections[cat.key]?.length ?? 0;
        return (
          <div key={cat.key} className="relative" onMouseEnter={() => setActiveCategory(cat.key)} onMouseLeave={() => setActiveCategory(null)}>
            <button onClick={() => setActiveCategory(active ? null : cat.key)} className={cn('flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-foreground', active ? 'bg-sidebar-active' : 'hover:bg-sidebar-active')}>
              <Icon size={14} className="text-muted" />
              <span className="flex-1 text-left">{cat.label}</span>
              {count > 0 && <span className="text-xs text-muted">{count}</span>}
              <ChevronRight size={14} className="text-muted" />
            </button>
            {active && (
              <div className="absolute right-full top-0 z-50 mr-1 max-h-64 w-48 overflow-y-auto rounded-xl border border-border bg-card p-1.5 shadow-lg">
                {cat.values.length === 0 ? (
                  <p className="px-2.5 py-2 text-xs text-muted">Nothing to filter by yet</p>
                ) : cat.values.map((val) => {
                  const toggleValue = valueForToggle(cat.key, val);
                  const selected = selections[cat.key]?.includes(toggleValue);
                  return (
                    <button key={val} onClick={() => toggle(cat.key, toggleValue)} className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-sm text-foreground hover:bg-sidebar-active">
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

//   function toggleValue(category: string, value: string) {
//     setSelections((prev) => {
//       const current = prev[category] ?? [];
//       const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
//       return { ...prev, [category]: next };
//     });
//   }
//
//   return (
//     <div ref={ref} className="absolute right-0 top-full z-50 mt-1 w-52 rounded-xl border border-border bg-card p-1.5 shadow-lg">
//       {FILTER_CATEGORIES.map((cat) => {
//         const Icon = cat.icon;
//         const active = activeCategory === cat.key;
//         const count = selections[cat.key]?.length ?? 0;
//         return (
//           <div key={cat.key} className="relative" onMouseEnter={() => setActiveCategory(cat.key)} onMouseLeave={() => setActiveCategory(null)}>
//             <button
//               onClick={() => setActiveCategory(active ? null : cat.key)}
//               className={cn('flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-foreground', active ? 'bg-sidebar-active' : 'hover:bg-sidebar-active')}
//             >
//               <Icon size={14} className="text-muted" />
//               <span className="flex-1 text-left">{cat.label}</span>
//               {count > 0 && <span className="text-xs text-muted">{count}</span>}
//               <ChevronRight size={14} className="text-muted" />
//             </button>
//             {active && (
//               <div className="absolute right-full top-0 z-50 mr-1 w-48 rounded-xl border border-border bg-card p-1.5 shadow-lg">
//                 {cat.values.map((val) => {
//                   const selected = selections[cat.key]?.includes(val);
//                   return (
//                     <button
//                       key={val}
//                       onClick={() => toggleValue(cat.key, val)}
//                       className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-sm text-foreground hover:bg-sidebar-active"
//                     >
//                       {val}
//                       {selected && <Check size={14} className="text-accent" />}
//                     </button>
//                   );
//                 })}
//               </div>
//             )}
//           </div>
//         );
//       })}
//     </div>
//   );
// }

export function Topbar() {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebar();
  const { title, breadcrumb, viewKey } = getPageMeta(pathname);
  const { registerOpenAddTaskModal } = useTaskActions();

  const [searchOpen, setSearchOpen] = useState(false);
  const [fieldsOpen, setFieldsOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [prefillStatus, setPrefillStatus] = useState<TaskStatus | undefined>(undefined);
  const searchRef = useRef<HTMLInputElement>(null);

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
          onClick={() => { setPrefillStatus(undefined); setAddTaskOpen(true); }}
          className="flex items-center gap-1 rounded-full bg-cta-primary px-4 py-1.5 text-sm font-medium text-cta-primary-foreground"
        >
          <Plus size={14} />
          Add {title === 'Projects' ? 'Project' : 'Task'}
        </button>
      </header>

      {addTaskOpen && <AddTaskPanel defaultStatus={prefillStatus} onClose={() => setAddTaskOpen(false)} />}
    </>
  );
}