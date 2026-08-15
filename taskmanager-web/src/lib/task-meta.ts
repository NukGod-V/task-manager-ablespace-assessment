import type { TaskPriority, TaskStatus } from '@/types/task';

export const PRIORITY_META: Record<TaskPriority, { label: string; textColor: string }> = {
  no_priority: { label: 'No Priority', textColor: 'text-muted' },
  urgent: { label: 'Urgent', textColor: 'text-priority-urgent' },
  high: { label: 'High', textColor: 'text-priority-high' },
  medium: { label: 'Medium', textColor: 'text-priority-medium' },
  low: { label: 'Low', textColor: 'text-priority-low' },
};

export const STATUS_META: Record<TaskStatus, { label: string; dot: string }> = {
  backlog: { label: 'Backlog', dot: 'bg-amber-500' },
  todo: { label: 'To Do', dot: 'bg-gray-400' },
  doing: { label: 'Doing', dot: 'bg-accent' },
  completed: { label: 'Completed', dot: 'bg-emerald-500' },
  on_hold: { label: 'On Hold', dot: 'bg-rose-500' },
};