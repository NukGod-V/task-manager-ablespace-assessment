export type TaskStatus = 'backlog' | 'todo' | 'doing' | 'completed' | 'on_hold';
export type TaskPriority = 'no_priority' | 'urgent' | 'high' | 'medium' | 'low';

export interface TaskAssignee {
  name: string;
  role: string;
  initials: string;
}

export interface MockTask {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  position: number;
  dueDate: string | null;
  assignee: TaskAssignee | null;
  labels: string[];
  projectId?: string | null;
  // NEW — populated from the task's owner (creator). "Reporter" and
  // "owner" are the same person in this schema; no separate concept exists.
  reporter?: { name: string; initials: string } | null;
}

export interface KanbanColumn {
  id: TaskStatus;
  title: string;
}