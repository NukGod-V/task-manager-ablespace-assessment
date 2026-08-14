'use client';

import { useState } from 'react';
import { BoardBoundary } from '@/components/kanban/board-boundary';
import { TaskListView } from '@/components/kanban/task-list-view';
import { TaskDetail } from '@/components/kanban/task-detail';
import { INITIAL_COLUMNS, INITIAL_TASKS } from '@/lib/mock-data';
import { useViewMode } from '@/components/layout/view-mode-context';
import type { KanbanColumn, MockTask } from '@/types/task';

export default function TasksPage() {
  const [viewMode] = useViewMode('tasks');
  const [columns, setColumns] = useState<KanbanColumn[]>(INITIAL_COLUMNS);
  const [tasks, setTasks] = useState<MockTask[]>(INITIAL_TASKS);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const selectedTask = selectedTaskId ? tasks.find((t) => t.id === selectedTaskId) ?? null : null;

  function handleSaveTask(updated: MockTask) {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }

  return (
    <div className="h-full">
      {viewMode === 'board' ? (
        <BoardBoundary
          columns={columns}
          tasks={tasks}
          setColumns={setColumns}
          setTasks={setTasks}
          onOpenTask={setSelectedTaskId}
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