'use client';

import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TaskCard } from './task-card';
import type { KanbanColumn, MockTask } from '@/types/task';

interface ColumnProps {
  column: KanbanColumn;
  tasks: MockTask[];
  onOpenTask: (taskId: string) => void;
}

export function Column({ column, tasks, onOpenTask }: ColumnProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: column.id,
    data: { type: 'column' },
  });

  const { setNodeRef: setDropRef } = useDroppable({
    id: column.id,
    data: { type: 'column-drop-area' },
  });

  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        // h-fit + max-h-full: column hugs its content and rounds off after
        // the last card, but still caps at the board's height and scrolls
        // internally if it has more cards than fit — was h-full before.
        'flex h-fit max-h-full w-[288px] shrink-0 flex-col rounded-xl bg-column-header',
        isDragging && 'opacity-50',
      )}
    >
      <div className="flex items-center gap-2 px-3 py-3">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab text-muted hover:text-foreground active:cursor-grabbing"
          aria-label={`Reorder ${column.title} column`}
        >
          <GripVertical size={16} />
        </button>
        <h3 className="flex-1 text-sm font-semibold text-foreground">{column.title}</h3>
        <span className="text-xs text-muted">{tasks.length}</span>
        <button
          className="rounded p-1 text-muted hover:bg-sidebar-active hover:text-foreground"
          aria-label={`Add task to ${column.title}`}
        >
          <Plus size={14} />
        </button>
        <button
          className="rounded p-1 text-muted hover:bg-sidebar-active hover:text-foreground"
          aria-label="Column menu"
        >
          <MoreHorizontal size={14} />
        </button>
      </div>

      <div ref={setDropRef} className="flex flex-col gap-2 overflow-y-auto px-2 pb-2">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onOpen={() => onOpenTask(task.id)} />
          ))}
        </SortableContext>

        <button className="mt-1 flex items-center gap-1.5 rounded-lg px-2 py-2 text-left text-xs text-muted hover:bg-sidebar-active hover:text-foreground">
          <Plus size={14} />
          Add Task
        </button>
      </div>
    </div>
  );
}