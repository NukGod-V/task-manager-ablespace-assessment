'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BoardBoundary } from '@/components/kanban/board-boundary';
import { TaskListView } from '@/components/kanban/task-list-view';
import { TaskDetail } from '@/components/kanban/task-detail';
import { INITIAL_COLUMNS } from '@/lib/kanban-columns';
import { fetchTasks, createTask, updateTask, reorderTask, type CreateTaskInput } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import { useViewMode } from '@/components/layout/view-mode-context';
import { useTaskActions } from '@/components/layout/task-actions-context';
import type { KanbanColumn, MockTask, TaskStatus } from '@/types/task';

export default function TasksPage() {
  const router = useRouter();
  const [viewMode] = useViewMode('tasks');
  const { setCreateTaskHandler } = useTaskActions();

  const [columns] = useState<KanbanColumn[]>(INITIAL_COLUMNS);
  const [tasks, setTasks] = useState<MockTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Basic route protection — this page now hits a real protected endpoint,
  // so an unauthenticated visit should redirect rather than surface a
  // raw 401 in the fetch below.
  useEffect(() => {
    if (!getAccessToken()) {
      router.push('/login');
      return;
    }
    fetchTasks()
      .then(setTasks)
      .catch(() => setError('Could not load tasks. Is the API running on :4000?'))
      .finally(() => setLoading(false));
  }, [router]);

  // Register this page's create-task logic with the Topbar's Add Task
  // modal via context — Topbar lives in the shared AppShell and has no
  // direct access to this page's state otherwise.
  useEffect(() => {
    setCreateTaskHandler(async (input: CreateTaskInput) => {
      const created = await createTask(input);
      setTasks((prev) => [...prev, created]);
    });
    return () => setCreateTaskHandler(null);
  }, [setCreateTaskHandler]);

  function handleTaskReordered(taskId: string, status: TaskStatus, position: number) {
    reorderTask(taskId, { status, position }).catch(() => {
      setError('Could not save the new position — it may revert on refresh.');
    });
  }

  async function handleSaveTask(updated: MockTask) {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t))); // optimistic
    try {
      const saved = await updateTask(updated.id, {
        title: updated.title,
        description: updated.description,
        status: updated.status,
        priority: updated.priority,
      });
      setTasks((prev) => prev.map((t) => (t.id === saved.id ? saved : t)));
    } catch {
      setError('Could not save changes to that task.');
    }
  }

  const selectedTask = selectedTaskId ? tasks.find((t) => t.id === selectedTaskId) ?? null : null;

  if (loading) {
    return <p className="text-sm text-muted">Loading tasks…</p>;
  }

  return (
    <div className="h-full">
      {error && (
        <p className="mb-3 rounded-lg bg-date-overdue-bg px-3 py-2 text-xs text-date-overdue">{error}</p>
      )}

      {viewMode === 'board' ? (
        <BoardBoundary
          columns={columns}
          tasks={tasks}
          setColumns={() => {}} // column order is local-only and not lifted here; no-op setter keeps Board's prop contract satisfied
          setTasks={setTasks}
          onOpenTask={setSelectedTaskId}
          onTaskReordered={handleTaskReordered}
        />
      ) : (
        <TaskListView columns={columns} tasks={tasks} onOpenTask={setSelectedTaskId} />
      )}

      {selectedTask && (
        <TaskDetail
          key={selectedTask.id}
          task={selectedTask}
          onClose={() => setSelectedTaskId(null)}
          onSave={handleSaveTask}
        />
      )}
    </div>
  );
}