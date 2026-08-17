import type { MockTask } from '@/types/task';

function dueDateBucket(dueDate: string | null): 'overdue' | 'today' | 'week' | 'none' {
  if (!dueDate) return 'none';
  const today = new Date(new Date().toDateString());
  const due = new Date(dueDate);
  const diffDays = Math.round((due.getTime() - today.getTime()) / 86400000);
  if (diffDays < 0) return 'overdue';
  if (diffDays === 0) return 'today';
  if (diffDays <= 7) return 'week';
  return 'none';
}

const DUE_DATE_VALUE_TO_BUCKET: Record<string, string> = {
  Overdue: 'overdue',
  'Due Today': 'today',
  'Due This Week': 'week',
  'No Date': 'none',
};

export function taskMatchesFilters(task: MockTask, selections: Record<string, string[]>): boolean {
  const status = selections.status ?? [];
  if (status.length && !status.includes(task.status)) return false;

  const priority = selections.priority ?? [];
  if (priority.length && !priority.includes(task.priority)) return false;

  const members = selections.members ?? [];
  if (members.length && !task.assignees.some((a) => members.includes(a.id))) return false;

  const reporter = selections.reporter ?? [];
  if (reporter.length && !(task.reporter && reporter.includes(task.reporter.id))) return false;

  const labels = selections.labels ?? [];
  if (labels.length && !task.labels.some((l) => labels.includes(l))) return false;

  const dueDate = selections.dueDate ?? [];
  if (dueDate.length) {
    const bucket = dueDateBucket(task.dueDate);
    const matches = dueDate.some((v) => DUE_DATE_VALUE_TO_BUCKET[v] === bucket);
    if (!matches) return false;
  }

  return true;
}