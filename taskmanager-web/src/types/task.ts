export type TaskStatus = 'backlog' | 'todo' | 'doing' | 'completed' | 'on_hold';
export type TaskPriority = 'no_priority' | 'urgent' | 'high' | 'medium' | 'low';

export interface TaskAssignee { id: string; name: string; initials: string; avatarUrl?: string | null; }
export interface TaskResource { id: string; name: string; url: string; }
export interface TaskSubtask { id: string; title: string; done: boolean; priority: TaskPriority; assigneeId: string | null; dueDate: string | null; }

export interface MockTask {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  position: number;
  dueDate: string | null;
  assignees: TaskAssignee[];
  labels: string[];
  resources: TaskResource[];
  subtasks: TaskSubtask[];
  projectId?: string | null;
  reporter?: { id: string; name: string; initials: string; avatarUrl?: string | null } | null;
}

export interface KanbanColumn { id: TaskStatus; title: string; }