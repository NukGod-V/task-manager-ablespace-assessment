// Mirrors the Phase 1 NestJS Task entity's core fields exactly, so Phase 4
// only means swapping the data source — not reshaping any component.
export type TaskStatus = 'backlog' | 'todo' | 'doing' | 'completed' | 'on_hold';
export type TaskPriority = 'no_priority' | 'urgent' | 'high' | 'medium' | 'low';

export interface TaskAssignee {
  name: string;
  role: string; // "Admin" / "Designer" / "QA Team" / "Security" — per spec's card examples
  initials: string;
}

export interface MockTask {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  position: number;
  // --- Not on the current backend Task entity yet (see chat note) ---
  dueDate: string | null; // ISO date
  assignee: TaskAssignee | null;
  labels: string[];
  projectId?: string | null;
}

export interface KanbanColumn {
  id: TaskStatus;
  title: string;
}