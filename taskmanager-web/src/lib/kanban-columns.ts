import type { KanbanColumn } from '@/types/task';

// Not fetched from the API — there's no backend concept of "columns," just
// the Task.status enum. This stays a static local structure; the 4 values
// here ARE the board layout.
export const INITIAL_COLUMNS: KanbanColumn[] = [
  { id: 'todo', title: 'To Do' },
  { id: 'doing', title: 'Doing' },
  { id: 'completed', title: 'Completed' },
  { id: 'on_hold', title: 'On Hold' },
];