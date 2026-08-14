'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BoardBoundary } from '@/components/kanban/board-boundary';
import { TaskListView } from '@/components/kanban/task-list-view';
import { TaskDetail } from '@/components/kanban/task-detail';
import { INITIAL_COLUMNS } from '@/lib/kanban-columns';
import { fetchTasks, createTask, updateTask, reorderTask, fetchProjects, type CreateTaskInput } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import { useViewMode } from '@/components/layout/view-mode-context';
import { useTaskActions } from '@/components/layout/task-actions-context';
import { useActiveProject } from '@/components/providers/active-project-provider';
import type { KanbanColumn, MockTask, TaskStatus } from '@/types/task';

export default function TasksPage() {
  const router = useRouter();
  const [viewMode] = useViewMode('tasks');
  const { setCreateTaskHandler, openAddTaskModal } = useTaskActions();
  const { activeProject, setActiveProject } = useActiveProject();

  const [columns, setColumns] = useState<KanbanColumn[]>(INITIAL_COLUMNS);
  const [tasks, setTasks] = useState<MockTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  useEffect(() => {
    if (!getAccessToken()) {
      router.push('/login');
      return;
    }

    async function init() {
      let project = activeProject;
      // No active project yet (first load, or localStorage not read yet) —
      // auto-pick the first project so the user is never stuck. Every
      // guest gets one for free on login, so this always resolves.
      if (!project) {
        const projects = await fetchProjects();
        if (projects.length === 0) {
          setError('No projects found — create one from the Projects page.');
          setLoading(false);
          return;
        }
        project = { id: projects[0].id, name: projects[0].name };
        setActiveProject(project);
        return; // effect re-runs once activeProject updates below
      }
      try {
        const loaded = await fetchTasks(project.id);
        setTasks(loaded);
      } catch {
        setError('Could not load tasks. Is the API running on :4000?');
      } finally {
        setLoading(false);
      }
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProject?.id, router]);

  useEffect(() => {
    if (!activeProject) return;
    setCreateTaskHandler(async (input: CreateTaskInput) => {
      const created = await createTask(activeProject.id, input);
      setTasks((prev) => [...prev, created]);
    });
    return () => setCreateTaskHandler(null);
  }, [setCreateTaskHandler, activeProject]);

  function handleTaskReordered(taskId: string, status: TaskStatus, position: number) {
    reorderTask(taskId, { status, position }).catch(() => {
      setError('Could not save the new position — it may revert on refresh.');
    });
  }

  async function handleSaveTask(updated: MockTask) {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
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

  if (loading) return <p className="text-sm text-muted">Loading tasks…</p>;

  return (
    <div className="h-full">
      {error && (
        <p className="mb-3 rounded-lg bg-date-overdue-bg px-3 py-2 text-xs text-date-overdue">{error}</p>
      )}

      {activeProject && (
        <p className="mb-3 text-xs text-muted">
          Project: <span className="font-medium text-foreground">{activeProject.name}</span>
        </p>
      )}

      {viewMode === 'board' ? (
        <BoardBoundary
          columns={columns}
          tasks={tasks}
          setColumns={setColumns}
          setTasks={setTasks}
          onOpenTask={setSelectedTaskId}
          onAddTask={openAddTaskModal}
          onTaskReordered={handleTaskReordered}
        />
      ) : (
        <TaskListView columns={columns} tasks={tasks} onOpenTask={setSelectedTaskId} />
      )}

      {selectedTask && (
        <TaskDetail key={selectedTask.id} task={selectedTask} onClose={() => setSelectedTaskId(null)} onSave={handleSaveTask} />
      )}
    </div>
  );
}