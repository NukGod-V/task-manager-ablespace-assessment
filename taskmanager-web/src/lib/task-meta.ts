import type { TaskPriority, TaskStatus } from '@/types/task';

export const PRIORITY_META: Record<TaskPriority, { label: string; textColor: string; level: number }> = {
  no_priority: { label: 'No Priority', textColor: 'text-muted', level: 0 },
  low: { label: 'Low', textColor: 'text-priority-low', level: 1 },
  medium: { label: 'Medium', textColor: 'text-priority-medium', level: 2 },
  high: { label: 'High', textColor: 'text-priority-high', level: 3 },
  urgent: { label: 'Urgent', textColor: 'text-priority-urgent', level: 4 },
};

export const STATUS_META: Record<TaskStatus, { label: string; dot: string }> = {
  backlog: { label: 'Backlog', dot: 'bg-amber-500' },
  todo: { label: 'To Do', dot: 'bg-gray-400' },
  doing: { label: 'Doing', dot: 'bg-accent' },
  completed: { label: 'Completed', dot: 'bg-emerald-500' },
  on_hold: { label: 'On Hold', dot: 'bg-rose-500' },
};