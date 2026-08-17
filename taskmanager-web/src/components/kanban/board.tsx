'use client';

import { useMemo, useState } from 'react';
import {
  DndContext, DragOverlay, PointerSensor, KeyboardSensor, useSensor, useSensors,
  closestCenter, type CollisionDetection, type DragStartEvent, type DragOverEvent, type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy, sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable';
import { Column } from './column';
import { TaskCard } from './task-card';
import type { KanbanColumn, MockTask, TaskStatus } from '@/types/task';
import type { FieldVisibility } from '@/lib/task-fields';

const collisionDetectionStrategy: CollisionDetection = (args) => {
  const activeType = args.active.data.current?.type;
  const allowedTypes = activeType === 'column' ? ['column'] : ['task', 'column-drop-area'];
  const filtered = args.droppableContainers.filter((c) => allowedTypes.includes(c.data.current?.type as string));
  return closestCenter({ ...args, droppableContainers: filtered });
};

export interface BoardProps {
  columns: KanbanColumn[];
  tasks: MockTask[];
  visibleFields: FieldVisibility;
  setColumns: React.Dispatch<React.SetStateAction<KanbanColumn[]>>;
  setTasks: React.Dispatch<React.SetStateAction<MockTask[]>>;
  onOpenTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onAddTask: (status: TaskStatus) => void;
  onTaskReordered: (taskId: string, status: TaskStatus, position: number) => void;
  onDuplicateTask: (taskId: string) => void;
}

export function Board({ columns, tasks, visibleFields, setColumns, setTasks, onOpenTask, onDeleteTask, onAddTask, onTaskReordered, onDuplicateTask }: BoardProps) {
  const [activeType, setActiveType] = useState<'column' | 'task' | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const tasksByColumn = useMemo(() => {
    const map = new Map<TaskStatus, MockTask[]>();
    for (const col of columns) map.set(col.id, tasks.filter((t) => t.status === col.id).sort((a, b) => a.position - b.position));
    return map;
  }, [columns, tasks]);

  const activeTask = activeType === 'task' ? tasks.find((t) => t.id === activeId) : undefined;
  const activeColumn = activeType === 'column' ? columns.find((c) => c.id === activeId) : undefined;

  function handleDragStart(event: DragStartEvent) {
    setActiveType((event.active.data.current?.type as 'column' | 'task') ?? null);
    setActiveId(event.active.id as string);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over || active.data.current?.type !== 'task') return;
    const overStatus = over.data.current?.status as TaskStatus | undefined;
    if (!overStatus) return;
    const activeIdStr = active.id as string;
    if (activeIdStr === over.id) return;
    setTasks((prev) => {
      const activeTask = prev.find((t) => t.id === activeIdStr);
      if (!activeTask || activeTask.status === overStatus) return prev;
      return prev.map((t) => (t.id === activeIdStr ? { ...t, status: overStatus } : t));
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveType(null);
    setActiveId(null);
    if (!over) return;

    if (active.data.current?.type === 'column') {
      if (active.id === over.id) return;
      setColumns((prev) => {
        const oldIndex = prev.findIndex((c) => c.id === active.id);
        const newIndex = prev.findIndex((c) => c.id === over.id);
        if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return prev;
        return arrayMove(prev, oldIndex, newIndex);
      });
      return;
    }

    if (active.data.current?.type === 'task') {
      let finalPosition = 0;
      let resolvedStatus: TaskStatus | undefined;

      setTasks((prev) => {
        const activeTaskEntry = prev.find((t) => t.id === active.id);
        if (!activeTaskEntry) return prev;
        const overData = over.data.current;
        const targetStatus = (overData?.status as TaskStatus | undefined) ?? activeTaskEntry.status;
        resolvedStatus = targetStatus;
        const overTaskId = overData?.type === 'task' ? (over.id as string) : null;

        const columnIds = prev.filter((t) => t.status === targetStatus).sort((a, b) => a.position - b.position).map((t) => t.id);
        const oldIndex = columnIds.indexOf(active.id as string);
        const newIndex = overTaskId ? columnIds.indexOf(overTaskId) : columnIds.length - 1;
        const reordered = oldIndex === -1
          ? [...columnIds, active.id as string]
          : arrayMove(columnIds, oldIndex, newIndex === -1 ? columnIds.length - 1 : newIndex);

        const positions = new Map(reordered.map((id, idx) => [id, idx * 1000]));
        finalPosition = positions.get(active.id as string) ?? activeTaskEntry.position;

        return prev.map((t) => {
          if (t.id === active.id) return { ...t, status: targetStatus, position: finalPosition };
          if (positions.has(t.id)) return { ...t, position: positions.get(t.id)! };
          return t;
        });
      });

      if (resolvedStatus) onTaskReordered(active.id as string, resolvedStatus, finalPosition);
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={collisionDetectionStrategy} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
      <div className="flex h-full gap-5 overflow-x-auto pb-2">
        <SortableContext items={columns.map((c) => c.id)} strategy={horizontalListSortingStrategy}>
          {columns.map((column) => (
            <Column key={column.id} column={column} tasks={tasksByColumn.get(column.id) ?? []}
                    visibleFields={visibleFields} onOpenTask={onOpenTask} onDeleteTask={onDeleteTask}
                    onAddTask={() => onAddTask(column.id)} onDuplicateTask={onDuplicateTask} />
          ))}
        </SortableContext>
      </div>
      <DragOverlay>
        {activeTask && <TaskCard task={activeTask} visibleFields={visibleFields} onOpen={() => {}} onDelete={() => {}} onDuplicate={() => {}}/>}
        {activeColumn && <div className="w-[288px] rounded-xl bg-column-header px-3 py-3 text-sm font-semibold text-foreground shadow-lg">{activeColumn.title}</div>}
      </DragOverlay>
    </DndContext>
  );
}