'use client';

import { useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  type CollisionDetection,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  arrayMove,
} from '@dnd-kit/sortable';
import { Column } from './column';
import { TaskCard } from './task-card';
import { TaskDetail } from './task-detail';
import { INITIAL_COLUMNS, INITIAL_TASKS } from '@/lib/mock-data';
import type { KanbanColumn, MockTask, TaskStatus } from '@/types/task';

// Fix for the "column snaps to far right" bug: closestCenter was scoring
// distance against EVERY droppable (cards included), so mid-drag it could
// lock onto a nearby card instead of the column — over.id then wouldn't
// match any column.id, silently breaking the index lookup. This filters
// candidates by type before scoring, so a column drag only ever considers
// other columns.
const collisionDetectionStrategy: CollisionDetection = (args) => {
  const activeType = args.active.data.current?.type;
  if (activeType === 'column') {
    const columnContainers = args.droppableContainers.filter(
      (container) => container.data.current?.type === 'column',
    );
    return closestCenter({ ...args, droppableContainers: columnContainers });
  }
  return closestCenter(args);
};

export function Board() {
  const [columns, setColumns] = useState<KanbanColumn[]>(INITIAL_COLUMNS);
  const [tasks, setTasks] = useState<MockTask[]>(INITIAL_TASKS);

  const [activeType, setActiveType] = useState<'column' | 'task' | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const tasksByColumn = useMemo(() => {
    const map = new Map<TaskStatus, MockTask[]>();
    for (const col of columns) {
      map.set(
        col.id,
        tasks.filter((t) => t.status === col.id).sort((a, b) => a.position - b.position),
      );
    }
    return map;
  }, [columns, tasks]);

  const activeTask = activeType === 'task' ? tasks.find((t) => t.id === activeId) : undefined;
  const activeColumn = activeType === 'column' ? columns.find((c) => c.id === activeId) : undefined;
  const selectedTask = selectedTaskId ? tasks.find((t) => t.id === selectedTaskId) ?? null : null;

  function handleDragStart(event: DragStartEvent) {
    setActiveType((event.active.data.current?.type as 'column' | 'task') ?? null);
    setActiveId(event.active.id as string);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over || active.data.current?.type !== 'task') return;

    const activeId = active.id as string;
    const overId = over.id as string;
    if (activeId === overId) return;

    setTasks((prev) => {
      const activeTask = prev.find((t) => t.id === activeId);
      if (!activeTask) return prev;

      const overTask = prev.find((t) => t.id === overId);
      const overStatus = overTask ? overTask.status : (overId as TaskStatus);

      if (activeTask.status === overStatus) return prev;
      return prev.map((t) => (t.id === activeId ? { ...t, status: overStatus } : t));
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveType(null);
    setActiveId(null);
    if (!over) return;

    if (active.data.current?.type === 'column') {
      // over.id is now guaranteed to be a column id thanks to the filtered
      // collision strategy above, so this lookup no longer fails.
      if (active.id === over.id) return;
      setColumns((prev) => {
        const oldIndex = prev.findIndex((c) => c.id === active.id);
        const newIndex = prev.findIndex((c) => c.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return prev;
        return arrayMove(prev, oldIndex, newIndex);
      });
      return;
    }

    if (active.data.current?.type === 'task') {
      setTasks((prev) => {
        const activeTask = prev.find((t) => t.id === active.id);
        if (!activeTask) return prev;

        const overTask = prev.find((t) => t.id === over.id);
        const targetStatus = overTask ? overTask.status : (over.id as TaskStatus);

        const columnIds = prev
          .filter((t) => t.status === targetStatus)
          .sort((a, b) => a.position - b.position)
          .map((t) => t.id);

        const oldIndex = columnIds.indexOf(active.id as string);
        const newIndex = overTask ? columnIds.indexOf(over.id as string) : columnIds.length - 1;

        const reordered =
          oldIndex === -1
            ? [...columnIds, active.id as string]
            : arrayMove(columnIds, oldIndex, newIndex);

        const positions = new Map(reordered.map((id, idx) => [id, idx * 1000]));

        return prev.map((t) => {
          if (t.id === active.id) {
            return { ...t, status: targetStatus, position: positions.get(t.id) ?? t.position };
          }
          if (positions.has(t.id)) {
            return { ...t, position: positions.get(t.id)! };
          }
          return t;
        });
      });
    }
  }

  function handleSaveTask(updated: MockTask) {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetectionStrategy}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex h-full gap-5 overflow-x-auto pb-2">
          <SortableContext items={columns.map((c) => c.id)} strategy={horizontalListSortingStrategy}>
            {columns.map((column) => (
              <Column
                key={column.id}
                column={column}
                tasks={tasksByColumn.get(column.id) ?? []}
                onOpenTask={setSelectedTaskId}
              />
            ))}
          </SortableContext>
        </div>

        <DragOverlay>
          {activeTask && <TaskCard task={activeTask} onOpen={() => {}} />}
          {activeColumn && (
            <div className="w-[288px] rounded-xl bg-column-header px-3 py-3 text-sm font-semibold text-foreground shadow-lg">
              {activeColumn.title}
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {selectedTask && (
        <TaskDetail
          key={selectedTask.id} // resets internal comment/edit state per task
          task={selectedTask}
          onClose={() => setSelectedTaskId(null)}
          onSave={handleSaveTask}
        />
      )}
    </>
  );
}