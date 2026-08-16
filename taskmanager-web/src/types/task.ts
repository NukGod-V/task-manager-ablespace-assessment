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
  assigneeId?: string | null; // NEW — needed to pre-select the Members dropdown by id, not fragile name-matching
  labels: string[];
  projectId?: string | null;
  reporter?: { name: string; initials: string } | null;
}

export interface KanbanColumn {
  id: TaskStatus;
  title: string;
}