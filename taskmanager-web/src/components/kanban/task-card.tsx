'use client';

import { useRef, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, MoreHorizontal, CalendarDays, Tag, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useClickOutside } from '@/hooks/use-click-outside';
import type { MockTask } from '@/types/task';

const AVATAR_GRADIENTS = [
  'from-violet-400 to-fuchsia-500',
  'from-sky-400 to-blue-500',
  'from-emerald-400 to-teal-500',
  'from-amber-400 to-orange-500',
  'from-rose-400 to-pink-500',
];

function gradientFor(name: string) {
  const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
}

function isOverdue(dueDate: string | null) {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date(new Date().toDateString());
}

function formatDate(dueDate: string) {
  return new Date(dueDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}

interface TaskCardProps {
  task: MockTask;
  onEdit: () => void; // the ONLY thing that opens the Task Detail modal now
}

export function TaskCard({ task, onEdit }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: 'task', status: task.status },
  });

  const style = { transform: CSS.Transform.toString(transform), transition };
  const overdue = isOverdue(task.dueDate);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useClickOutside(menuRef, () => setMenuOpen(false));

  return (
    <div
      ref={setNodeRef}
      style={style}
      // No onClick / cursor-pointer on the card body anymore — Edit is the
      // only path into the detail view now.
      className={cn('group rounded-lg border border-border bg-card p-4', isDragging && 'opacity-50')}
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 shrink-0 cursor-grab text-muted opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
          aria-label="Drag task"
        >
          <GripVertical size={14} />
        </button>

        <p className="flex-1 text-sm font-medium text-foreground">{task.title}</p>

        <div ref={menuRef} className="relative shrink-0">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="rounded p-0.5 text-muted opacity-0 transition-opacity hover:bg-sidebar-active group-hover:opacity-100"
            aria-label="Card menu"
          >
            <MoreHorizontal size={14} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full z-10 mt-1 w-32 rounded-xl border border-border bg-card p-1.5 shadow-lg">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onEdit();
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-foreground hover:bg-sidebar-active"
              >
                <Pencil size={13} />
                Edit
              </button>
            </div>
          )}
        </div>
      </div>

      {task.assignee && (
        <div className="mt-3 flex items-center gap-2">
          <div className={cn('flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br text-[9px] font-medium text-white', gradientFor(task.assignee.name))}>
            {task.assignee.initials}
          </div>
          <span className="text-xs text-secondary">{task.assignee.role}</span>
        </div>
      )}

      {task.labels.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {task.labels.map((label) => (
            <span key={label} className="flex items-center gap-1 rounded-full bg-chip-bg px-2 py-0.5 text-[11px] font-medium text-chip-text">
              <Tag size={10} />
              {label}
            </span>
          ))}
        </div>
      )}

      {task.dueDate && (
        <div className={cn('mt-3 flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[11px]', overdue ? 'bg-date-overdue-bg text-date-overdue' : 'text-muted')}>
          <CalendarDays size={11} />
          {formatDate(task.dueDate)}
        </div>
      )}
    </div>
  );
}