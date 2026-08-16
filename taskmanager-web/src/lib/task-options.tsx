import type { TaskStatus, TaskPriority } from '@/types/task';
import { PriorityIcon } from '@/components/icons/priority-icon';

export const STATUS_OPTIONS: { value: TaskStatus; label: string; dot: string }[] = [
  { value: 'backlog', label: 'Backlog', dot: 'bg-amber-500' },
  { value: 'todo', label: 'To Do', dot: 'bg-gray-400' },
  { value: 'doing', label: 'Doing', dot: 'bg-accent' },
  { value: 'completed', label: 'Completed', dot: 'bg-emerald-500' },
  { value: 'on_hold', label: 'On Hold', dot: 'bg-rose-500' },
];

// Order matches image 4 exactly: No Priority, Urgent, High, Medium, Low.
export const PRIORITY_OPTIONS: { value: TaskPriority; label: string; level: number; textColor: string }[] = [
  { value: 'no_priority', label: 'No Priority', level: 0, textColor: 'text-muted' },
  { value: 'urgent', label: 'Urgent', level: 4, textColor: 'text-priority-urgent' },
  { value: 'high', label: 'High', level: 3, textColor: 'text-priority-high' },
  { value: 'medium', label: 'Medium', level: 2, textColor: 'text-priority-medium' },
  { value: 'low', label: 'Low', level: 1, textColor: 'text-priority-low' },
];

export function priorityLeading(opt: { level: number; textColor: string }) {
  return opt.level === 0 ? (
    <span className="px-0.5 text-base leading-none text-muted">·</span>
  ) : (
    <PriorityIcon level={opt.level} colorClass={opt.textColor} size={13} />
  );
}