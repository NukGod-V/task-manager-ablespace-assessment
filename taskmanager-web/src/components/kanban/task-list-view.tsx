'use client';

import { useRef, useState } from 'react';
import { ChevronDown, ChevronRight, MoreHorizontal, Plus, Tag, GripVertical, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useClickOutside } from '@/hooks/use-click-outside';
import { PRIORITY_META, STATUS_META } from '@/lib/task-meta';
import { PriorityIcon } from '@/components/icons/priority-icon';
import type { KanbanColumn, MockTask } from '@/types/task';
import type { FieldVisibility } from '@/lib/task-fields';

interface TaskListViewProps {
  columns: KanbanColumn[];
  tasks: MockTask[];
  visibleFields: FieldVisibility;
  onOpenTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

export function TaskListView({ columns, tasks, visibleFields, onOpenTask, onDeleteTask }: TaskListViewProps) {
  const [collapsedGroups, setCollapsedGroups] = useState<string[]>([]);
  function toggleGroup(id: string) {
    setCollapsedGroups((prev) => (prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]));
  }

  return (
    <div className="flex flex-col gap-5">
      {columns.map((column) => {
        const columnTasks = tasks.filter((t) => t.status === column.id).sort((a, b) => a.position - b.position);
        const collapsed = collapsedGroups.includes(column.id);
        return (
          <div key={column.id}>
            <button onClick={() => toggleGroup(column.id)} className="mb-1.5 flex items-center gap-1.5 px-1 py-1 text-sm font-medium text-foreground">
              {collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
              {column.title}
              <span className="text-xs font-normal text-muted">{columnTasks.length}</span>
            </button>
            {!collapsed && (
              <div className="overflow-hidden rounded-xl border border-border">
                <div className="flex items-center gap-3 border-b border-border bg-sidebar px-4 py-2.5 text-xs font-medium text-muted">
                  <span className="w-4" />
                  <span className="flex-1">Task</span>
                  {visibleFields.Status && <span className="w-24">Status</span>}
                  {visibleFields.Priority && <span className="w-28">Priority</span>}
                  {visibleFields.Members && <span className="w-20">Members</span>}
                  {visibleFields['Due Date'] && <span className="w-28">Due Date</span>}
                  {visibleFields.Labels && <span className="w-32">Labels</span>}
                  {visibleFields.Reporter && <span className="w-28">Reporter</span>}
                  <span className="w-10">Actions</span>
                </div>
                {columnTasks.map((task) => (
                  <TaskRow key={task.id} task={task} visibleFields={visibleFields} onOpen={() => onOpenTask(task.id)} onDelete={() => onDeleteTask(task.id)} />
                ))}
                <button className="flex items-center gap-1.5 px-4 py-3 text-left text-xs text-muted hover:bg-sidebar-active hover:text-foreground">
                  <Plus size={13} /> Add Task
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function TaskRow({ task, visibleFields, onOpen, onDelete }: { task: MockTask; visibleFields: FieldVisibility; onOpen: () => void; onDelete: () => void }) {
  const priority = PRIORITY_META[task.priority];
  const statusMeta = STATUS_META[task.status];
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useClickOutside(menuRef, () => setMenuOpen(false));

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    setMenuOpen(false);
    if (window.confirm("Delete this task? This can't be undone.")) onDelete();
  }

  return (
    <div onClick={onOpen} className="group flex cursor-pointer items-center gap-3 border-b border-border px-4 py-3.5 text-sm last:border-b-0 hover:bg-sidebar-active/50">
      {/* Decorative parity with the board's drag handle — reordering isn't wired in List view yet */}
      <GripVertical size={14} className="shrink-0 text-muted opacity-0 group-hover:opacity-100" />
      <span className="flex-1 truncate text-foreground">{task.title}</span>

      {visibleFields.Status && (
        <span className="flex w-24 items-center gap-1.5 text-xs text-muted">
          <span className={cn('h-1.5 w-1.5 rounded-full', statusMeta.dot)} />
          {statusMeta.label}
        </span>
      )}

      {visibleFields.Priority && (
        <span className={cn('flex w-28 items-center gap-1 text-xs', priority.textColor)}>
          {task.priority !== 'no_priority' && <PriorityIcon level={priority.level} colorClass={priority.textColor} size={12} />}
          {task.priority === 'no_priority' ? '—' : priority.label}
        </span>
      )}

      {visibleFields.Members && (
        <span className="w-20">
          {task.assignee ? (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-[10px] text-white">{task.assignee.initials}</div>
          ) : <span className="text-xs text-muted">—</span>}
        </span>
      )}

      {visibleFields['Due Date'] && (
        <span className="w-28 text-xs text-muted">
          {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : '—'}
        </span>
      )}

      {visibleFields.Labels && (
        <span className="flex w-32 flex-wrap gap-1">
          {task.labels.length > 0 ? task.labels.slice(0, 2).map((l) => (
            <span key={l} className="flex items-center gap-0.5 rounded-full bg-chip-bg px-1.5 py-0.5 text-[10px] text-chip-text"><Tag size={9} /> {l}</span>
          )) : <span className="text-xs text-muted">—</span>}
        </span>
      )}

      {visibleFields.Reporter && <span className="w-28 truncate text-xs text-muted">{task.reporter?.name ?? '—'}</span>}

      <div ref={menuRef} className="relative w-10 shrink-0">
        <button onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o); }} className="text-muted hover:text-foreground" aria-label="Row actions">
          <MoreHorizontal size={16} />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-full z-10 mt-1 w-32 rounded-xl border border-border bg-card p-1.5 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => { setMenuOpen(false); onOpen(); }} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-foreground hover:bg-sidebar-active"><Pencil size={13} /> Edit</button>
            <button onClick={handleDelete} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-destructive hover:bg-sidebar-active"><Trash2 size={13} /> Delete</button>
          </div>
        )}
      </div>
    </div>
  );
}