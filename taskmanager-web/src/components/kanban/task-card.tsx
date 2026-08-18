'use client';

import { useRef, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, MoreHorizontal, CalendarDays, Tag, Pencil, Trash2, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useClickOutside } from '@/hooks/use-click-outside';
import { PRIORITY_META, STATUS_META } from '@/lib/task-meta';
import { PriorityIcon } from '@/components/icons/priority-icon';
import type { MockTask } from '@/types/task';
import type { FieldVisibility } from '@/lib/task-fields';
import { Avatar } from '@/components/ui/avatar';

// REVERTED — back to conditional overdue coloring, per your instruction.
function isOverdue(dueDate: string | null) {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date(new Date().toDateString());
}
function formatDate(dueDate: string) {
  return new Date(dueDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}

interface TaskCardProps {
  task: MockTask;
  visibleFields: FieldVisibility;
  onOpen: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export function TaskCard({ task, visibleFields, onOpen, onDelete, onDuplicate }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id, data: { type: 'task', status: task.status } });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const overdue = isOverdue(task.dueDate);
  const priority = PRIORITY_META[task.priority];
  const statusMeta = STATUS_META[task.status];

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useClickOutside(menuRef, () => setMenuOpen(false));

  const showAssignees = visibleFields.Members && task.assignees.length > 0;
  const showDueDate = visibleFields['Due Date'] && !!task.dueDate;
  const showMetaRow = showAssignees || showDueDate;
  const showPriority = visibleFields.Priority && task.priority !== 'no_priority';
  const showStatus = visibleFields.Status;
  const showLabels = visibleFields.Labels && task.labels.length > 0;
  const showReporter = visibleFields.Reporter && task.reporter;

  function handleDeleteClick(e: React.MouseEvent) {
    e.stopPropagation(); setMenuOpen(false);
    if (window.confirm("Delete this task? This can't be undone.")) onDelete();
  }

  return (
    <div ref={setNodeRef} style={style} onClick={onOpen} className={cn('group cursor-pointer rounded-lg border border-border bg-card p-4', isDragging && 'opacity-50')}>
      <div className="flex items-start gap-2">
        <button {...attributes} {...listeners} onClick={(e) => e.stopPropagation()} className="mt-0.5 shrink-0 cursor-grab text-muted opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing" aria-label="Drag task">
          <GripVertical size={14} />
        </button>
        <p className="flex-1 text-sm font-medium text-foreground">{task.title}</p>
        <div ref={menuRef} className="relative shrink-0">
          <button onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o); }} className="rounded p-0.5 text-muted opacity-0 transition-opacity hover:bg-sidebar-active group-hover:opacity-100" aria-label="Card menu">
            <MoreHorizontal size={14} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full z-50 mt-1 w-32 rounded-xl border border-border bg-card p-1.5 shadow-lg" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => { setMenuOpen(false); onOpen(); }} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-foreground hover:bg-sidebar-active"><Pencil size={13} /> Edit</button>
              <button onClick={() => { setMenuOpen(false); onDuplicate(); }} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-foreground hover:bg-sidebar-active"><Copy size={13} /> Duplicate</button>
              <button onClick={handleDeleteClick} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-destructive hover:bg-sidebar-active"><Trash2 size={13} /> Delete</button>
            </div>
          )}
        </div>
      </div>

      {(showPriority || showStatus || showMetaRow || showLabels || showReporter) && (
        <div className="mt-2 flex flex-col gap-2">
          {showPriority && (
            <div className={cn('flex items-center gap-1 text-[11px] font-medium', priority.textColor)}>
              <PriorityIcon level={priority.level} colorClass={priority.textColor} size={12} />{priority.label}
            </div>
          )}
          {showStatus && (
            <div className="flex items-center gap-1.5 text-[11px] text-muted">
              <span className={cn('h-1.5 w-1.5 rounded-full', statusMeta.dot)} />{statusMeta.label}
            </div>
          )}
          {showMetaRow && (
            <div className="flex items-center justify-between gap-2">
              {showAssignees ? (
                <div className="flex -space-x-1.5">
                  {task.assignees.slice(0, 3).map((a) => (
                      <Avatar key={a.id} name={a.name} avatarUrl={a.avatarUrl} initials={a.initials} size={20}
                              className="border-2 border-card"/>
                  ))}
                  {task.assignees.length > 3 && <div
                      className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-card bg-sidebar-active text-[8px] text-secondary">+{task.assignees.length - 3}</div>}
                </div>
              ) : <span />}
              {showDueDate && task.dueDate && (
                <div className={cn('flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px]', overdue ? 'bg-date-overdue-bg text-date-overdue' : 'text-muted')}>
                  <CalendarDays size={11} />{formatDate(task.dueDate)}
                </div>
              )}
            </div>
          )}
          {showLabels && (
            <div className="flex flex-wrap gap-1.5">
              {task.labels.map((label) => (
                <span key={label} className="flex items-center gap-1 rounded-full bg-chip-bg px-2 py-0.5 text-[11px] font-medium text-chip-text"><Tag size={10} /> {label}</span>
              ))}
            </div>
          )}
          {showReporter && <p className="text-[11px] text-muted">Reported by {task.reporter!.name}</p>}
        </div>
      )}
    </div>
  );
}