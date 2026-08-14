'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, MoreHorizontal, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { KanbanColumn, MockTask, TaskPriority } from '@/types/task';

const PRIORITY_META: Record<TaskPriority, { label: string; color: string }> = {
  no_priority: { label: 'No Priority', color: 'text-muted' },
  urgent: { label: 'Urgent', color: 'text-priority-urgent' },
  high: { label: 'High', color: 'text-priority-high' },
  medium: { label: 'Medium', color: 'text-priority-medium' },
  low: { label: 'Low', color: 'text-priority-low' },
};

interface TaskListViewProps {
  columns: KanbanColumn[];
  tasks: MockTask[];
  onOpenTask: (id: string) => void;
}

// Grouped-by-status, collapsible table view per figma-extraction §2.4.
// Reuses the SAME columns/tasks state as Board — no separate data copy.
export function TaskListView({ columns, tasks, onOpenTask }: TaskListViewProps) {
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
            <button
              onClick={() => toggleGroup(column.id)}
              className="mb-1.5 flex items-center gap-1.5 px-1 py-1 text-sm font-medium text-foreground"
            >
              {collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
              {column.title}
              <span className="text-xs font-normal text-muted">{columnTasks.length}</span>
            </button>

            {!collapsed && (
              <div className="overflow-hidden rounded-xl border border-border">
                <div className="grid grid-cols-[1fr_110px_100px_120px_60px] gap-2 border-b border-border bg-sidebar px-4 py-2 text-xs font-medium text-muted">
                  <span>Task</span>
                  <span>Priority</span>
                  <span>Members</span>
                  <span>Due Date</span>
                  <span>Actions</span>
                </div>

                {columnTasks.map((task) => (
                  <TaskRow key={task.id} task={task} onEdit={() => onOpenTask(task.id)} />
                ))}

                <button className="flex items-center gap-1.5 px-4 py-2.5 text-left text-xs text-muted hover:bg-sidebar-active hover:text-foreground">
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

function TaskRow({ task, onEdit }: { task: MockTask; onEdit: () => void }) {
  const priority = PRIORITY_META[task.priority];
  return (
    <div className="grid grid-cols-[1fr_110px_100px_120px_60px] items-center gap-2 border-b border-border px-4 py-2.5 text-sm last:border-b-0 hover:bg-sidebar-active/50">
      <span className="truncate text-foreground">{task.title}</span>
      <span className={cn('text-xs', priority.color)}>{priority.label}</span>
      {task.assignee ? (
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[9px] text-white">
          {task.assignee.initials}
        </div>
      ) : (
        <span className="text-xs text-muted">—</span>
      )}
      <span className="text-xs text-muted">
        {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : '—'}
      </span>
      <button onClick={onEdit} className="w-fit text-muted hover:text-foreground" aria-label="Row actions">
        <MoreHorizontal size={16} />
      </button>
    </div>
  );
}