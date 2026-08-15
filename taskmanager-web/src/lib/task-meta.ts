import { SignalLow, SignalMedium, SignalHigh, AlertTriangle, type LucideIcon } from 'lucide-react';
import type { TaskPriority, TaskStatus } from '@/types/task';

// Signal-bar icons that visually grow with severity — matches image 3's
// small bar-chart glyphs next to Priority. Urgent gets a distinct triangle
// rather than a 4th bar level, since lucide has no SignalVeryHigh and a
// triangle reads as more urgent than "more bars" would anyway.
export const PRIORITY_META: Record<TaskPriority, { label: string; textColor: string; icon: LucideIcon | null }> = {
  no_priority: { label: 'No Priority', textColor: 'text-muted', icon: null },
  low: { label: 'Low', textColor: 'text-priority-low', icon: SignalLow },
  medium: { label: 'Medium', textColor: 'text-priority-medium', icon: SignalMedium },
  high: { label: 'High', textColor: 'text-priority-high', icon: SignalHigh },
  urgent: { label: 'Urgent', textColor: 'text-priority-urgent', icon: AlertTriangle },
};

export const STATUS_META: Record<TaskStatus, { label: string; dot: string }> = {
  backlog: { label: 'Backlog', dot: 'bg-amber-500' },
  todo: { label: 'To Do', dot: 'bg-gray-400' },
  doing: { label: 'Doing', dot: 'bg-accent' },
  completed: { label: 'Completed', dot: 'bg-emerald-500' },
  on_hold: { label: 'On Hold', dot: 'bg-rose-500' },
};