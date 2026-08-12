import type { KanbanColumn, MockTask } from '@/types/task';

// Order here IS the initial column order — Board's column-reorder logic
// operates on this array, not a hardcoded order elsewhere.
export const INITIAL_COLUMNS: KanbanColumn[] = [
  { id: 'todo', title: 'To Do' },
  { id: 'doing', title: 'Doing' },
  { id: 'completed', title: 'Completed' },
  { id: 'on_hold', title: 'On Hold' },
];

export const INITIAL_TASKS: MockTask[] = [
  {
    id: 'task-1',
    title: 'Write API Documentation',
    description: null,
    status: 'todo',
    priority: 'high',
    position: 0,
    dueDate: '2026-07-29', // overdue relative to Aug 12, 2026
    assignee: { name: 'Alex Chen', role: 'Admin', initials: 'AC' },
    labels: ['Documentation', 'Development'],
  },
  {
    id: 'task-2',
    title: 'Design onboarding flow',
    description: null,
    status: 'todo',
    priority: 'medium',
    position: 1000,
    dueDate: '2026-08-20',
    assignee: { name: 'Priya Rao', role: 'Designer', initials: 'PR' },
    labels: ['Design'],
  },
  {
    id: 'task-3',
    title: 'Set up CI/CD pipeline',
    description: null,
    status: 'doing',
    priority: 'urgent',
    position: 0,
    dueDate: '2026-07-31', // overdue
    assignee: { name: 'Sam Torres', role: 'Security', initials: 'ST' },
    labels: ['Deployment'],
  },
  {
    id: 'task-4',
    title: 'Refactor auth middleware',
    description: null,
    status: 'doing',
    priority: 'high',
    position: 1000,
    dueDate: null,
    assignee: { name: 'Alex Chen', role: 'Admin', initials: 'AC' },
    labels: ['Development', 'Testing'],
  },
  {
    id: 'task-5',
    title: 'QA pass on checkout flow',
    description: null,
    status: 'completed',
    priority: 'low',
    position: 0,
    dueDate: '2026-08-01',
    assignee: { name: 'Nina Patel', role: 'QA Team', initials: 'NP' },
    labels: ['Testing'],
  },
  {
    id: 'task-6',
    title: 'User research interviews',
    description: null,
    status: 'on_hold',
    priority: 'no_priority',
    position: 0,
    dueDate: null,
    assignee: { name: 'Priya Rao', role: 'Designer', initials: 'PR' },
    labels: ['Research'],
  },
  {
    id: 'task-7',
    title: 'Migrate database schema',
    description: null,
    status: 'on_hold',
    priority: 'medium',
    position: 1000,
    dueDate: '2026-09-05',
    assignee: { name: 'Sam Torres', role: 'Security', initials: 'ST' },
    labels: ['Deployment', 'Development'],
  },
];