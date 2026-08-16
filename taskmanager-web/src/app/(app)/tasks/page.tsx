'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BoardBoundary } from '@/components/kanban/board-boundary';
import { TaskListView } from '@/components/kanban/task-list-view';
import { INITIAL_COLUMNS } from '@/lib/kanban-columns';
import {
  fetchTasks, createTask, updateTask, reorderTask, deleteTask, fetchProjects,
  type CreateTaskInput, type UpdateTaskInput,
} from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import { useViewMode } from '@/components/layout/view-mode-context';
import { useFields } from '@/components/layout/fields-context';
import { useTaskActions } from '@/components/layout/task-actions-context';
import { useActiveProject } from '@/components/providers/active-project-provider';
import type { KanbanColumn, MockTask, TaskStatus } from '@/types/task';

export default function TasksPage() {
  const router = useRouter();
  const [viewMode] = useViewMode('tasks');
  const { fields: visibleFields } = useFields('tasks', viewMode);
  const { setCreateTaskHandler, openAddTaskModal } = useTaskActions();
  const { activeProject, setActiveProject, hydrated } = useActiveProject();

  const [columns, setColumns] = useState<KanbanColumn[]>(INITIAL_COLUMNS);
  const [tasks, setTasks] = useState<MockTask[]>([]);
  const [projectMembers, setProjectMembers] = useState<{ id: string; username: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!getAccessToken()) { router.push('/login'); return; }
    if (!hydrated) return;

    async function init() {
      setLoading(true);
      setError(null);
      let project = activeProject;
      if (!project) {
        const projects = await fetchProjects();
        if (projects.length === 0) { setError('No projects found — create one from the Projects page.'); setLoading(false); return; }
        project = { id: projects[0].id, name: projects[0].name };
        setActiveProject(project);
        return;
      }
      try {
        const [loadedTasks, allProjects] = await Promise.all([fetchTasks(project.id), fetchProjects()]);
        setTasks(loadedTasks);
        const matched = allProjects.find((p) => p.id === project!.id);
        setProjectMembers(matched?.members ?? []); // NEW — powers the Members quick-select in List view
      } catch (err) {
        const message = err instanceof Error ? err.message : '';
        if (message.includes('403') || message.includes('404')) {
          const projects = await fetchProjects();
          if (projects.length > 0) { setActiveProject({ id: projects[0].id, name: projects[0].name }); return; }
          setError('No accessible projects found — create one from the Projects page.');
        } else {
          setError(message || 'Could not load tasks. Is the API running on :4000?');
        }
      } finally {
        setLoading(false);
      }
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProject?.id, hydrated, router]);

  useEffect(() => {
    setCreateTaskHandler(async (projectId: string, input: CreateTaskInput) => {
      const created = await createTask(projectId, input);
      if (created.projectId === activeProject?.id) setTasks((prev) => [...prev, created]);
      return created;
    });
    return () => setCreateTaskHandler(null);
  }, [setCreateTaskHandler, activeProject]);

  function handleTaskReordered(taskId: string, status: TaskStatus, position: number) {
    reorderTask(taskId, { status, position }).catch(() => setError('Could not save the new position — it may revert on refresh.'));
  }

  async function handleDeleteTask(taskId: string) {
    const previous = tasks;
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    try {
      await deleteTask(taskId);
    } catch {
      setTasks(previous);
      setError('Could not delete that task.');
    }
  }

  // Backs the List view's inline "+" quick-edit cells (priority / member / date).
  async function handleQuickUpdate(taskId: string, patch: UpdateTaskInput) {
    const previous = tasks;
    setTasks((prev) => prev.map((t) => {
      if (t.id !== taskId) return t;
      const next = { ...t };
      if (patch.priority !== undefined) next.priority = patch.priority;
      if (patch.dueDate !== undefined) next.dueDate = patch.dueDate;
      if (patch.assigneeId !== undefined) {
        if (!patch.assigneeId) {
          next.assignee = null;
          next.assigneeId = null;
        } else {
          const member = projectMembers.find((m) => m.id === patch.assigneeId);
          next.assigneeId = patch.assigneeId;
          if (member) next.assignee = { name: member.username, role: 'Member', initials: member.username[0]?.toUpperCase() ?? '?' };
        }
      }
      return next;
    }));
    try {
      const saved = await updateTask(taskId, patch);
      setTasks((prev) => prev.map((t) => (t.id === saved.id ? saved : t)));
    } catch {
      setTasks(previous);
      setError('Could not save that change.');
    }
  }

  function handleOpenTask(taskId: string) {
    router.push(`/tasks/${taskId}`);
  }

  if (!hydrated || loading) return <p className="text-sm text-muted">Loading tasks…</p>;

  return (
    <div className="h-full">
      {error && <p className="mb-3 rounded-lg bg-date-overdue-bg px-3 py-2 text-xs text-date-overdue">{error}</p>}
      {activeProject && <p className="mb-3 text-xs text-muted">Project: <span className="font-medium text-foreground">{activeProject.name}</span></p>}

      {viewMode === 'board' ? (
        <BoardBoundary
          columns={columns}
          tasks={tasks}
          visibleFields={visibleFields}
          setColumns={setColumns}
          setTasks={setTasks}
          onOpenTask={handleOpenTask}
          onDeleteTask={handleDeleteTask}
          onAddTask={openAddTaskModal}
          onTaskReordered={handleTaskReordered}
        />
      ) : (
        <TaskListView
          columns={columns}
          tasks={tasks}
          visibleFields={visibleFields}
          projectMembers={projectMembers}
          setTasks={setTasks}
          onOpenTask={handleOpenTask}
          onDeleteTask={handleDeleteTask}
          onAddTask={openAddTaskModal}
          onUpdateTask={handleQuickUpdate}
          onTaskReordered={handleTaskReordered}
        />
      )}
    </div>
  );
}