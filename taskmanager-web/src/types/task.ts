export type TaskStatus = 'backlog' | 'todo' | 'doing' | 'completed' | 'on_hold';
export type TaskPriority = 'no_priority' | 'urgent' | 'high' | 'medium' | 'low';

export interface TaskAssignee { id: string; name: string; initials: string; }
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
  assignees: TaskAssignee[]; // CHANGED — was a single `assignee`
  labels: string[];
  resources: TaskResource[]; // NEW
  subtasks: TaskSubtask[]; // NEW
  projectId?: string | null;
  reporter?: { id: string; name: string; initials: string } | null; // now includes id, for filter matching
}

export interface KanbanColumn { id: TaskStatus; title: string; }