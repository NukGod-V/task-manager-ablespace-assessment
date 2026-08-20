'use client';

import { useRef, useState } from 'react';
import {
  DndContext, DragOverEvent, DragEndEvent, PointerSensor, KeyboardSensor,
  useSensor, useSensors, closestCenter, useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy, sortableKeyboardCoordinates, arrayMove, useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronDown, ChevronRight, MoreHorizontal, Plus, Tag, GripVertical, Pencil, Trash2, Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useClickOutside } from '@/hooks/use-click-outside';
import { PRIORITY_META, STATUS_META } from '@/lib/task-meta';
import { PRIORITY_OPTIONS, priorityLeading } from '@/lib/task-options';
import { PriorityIcon } from '@/components/icons/priority-icon';
import { InlineQuickCell } from './inline-quick-cell';
import { Avatar } from '@/components/ui/avatar';
import type { KanbanColumn, MockTask, TaskStatus, TaskPriority } from '@/types/task';
import type { FieldVisibility } from '@/lib/task-fields';
import type { UpdateTaskInput } from '@/lib/api';

interface ProjectMember { id: string; username: string; }

interface TaskListViewProps {
  columns: KanbanColumn[];
  tasks: MockTask[];
  visibleFields: FieldVisibility;
  projectMembers: ProjectMember[];
  setTasks: React.Dispatch<React.SetStateAction<MockTask[]>>;
  onOpenTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onAddTask: (status: TaskStatus) => void;
  onUpdateTask: (taskId: string, patch: UpdateTaskInput) => void;
  onTaskReordered: (taskId: string, status: TaskStatus, position: number) => void;
  onDuplicateTask: (id: string) => void;
}

function isOverdue(dueDate: string | null) {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date(new Date().toDateString());
}
function formatDate(dueDate: string) {
  return new Date(dueDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function TaskListView({
  columns, tasks, visibleFields, projectMembers, setTasks,
  onOpenTask, onDeleteTask, onAddTask, onUpdateTask, onTaskReordered, onDuplicateTask,
}: TaskListViewProps) {
  const [collapsedGroups, setCollapsedGroups] = useState<string[]>([]);
  function toggleGroup(id: string) {
    setCollapsedGroups((prev) => (prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]));
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;
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
    if (!over) return;
    const activeTask = tasks.find((t) => t.id === active.id);
    if (!activeTask) return;

    const overData = over.data.current;
    const targetStatus = (overData?.status as TaskStatus | undefined) ?? activeTask.status;
    const overTaskId = overData?.type === 'task' ? (over.id as string) : null;

    const groupIds = tasks
      .filter((t) => t.status === targetStatus)
      .sort((a, b) => a.position - b.position)
      .map((t) => t.id);

    const oldIndex = groupIds.indexOf(active.id as string);
    const newIndex = overTaskId ? groupIds.indexOf(overTaskId) : groupIds.length - 1;
    const reordered = oldIndex === -1
      ? [...groupIds, active.id as string]
      : arrayMove(groupIds, oldIndex, newIndex === -1 ? groupIds.length - 1 : newIndex);

    const positions = new Map(reordered.map((id, idx) => [id, idx * 1000]));
    const finalPosition = positions.get(active.id as string)!;

    setTasks((prev) => prev.map((t) => {
      if (t.id === active.id) return { ...t, status: targetStatus, position: finalPosition };
      if (positions.has(t.id)) return { ...t, position: positions.get(t.id)! };
      return t;
    }));
    onTaskReordered(active.id as string, targetStatus, finalPosition);
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
      <div className="flex flex-col gap-5">
        {columns.map((column) => (
          <TaskGroup
            key={column.id}
            column={column}
            tasks={tasks.filter((t) => t.status === column.id).sort((a, b) => a.position - b.position)}
            visibleFields={visibleFields}
            projectMembers={projectMembers}
            collapsed={collapsedGroups.includes(column.id)}
            onToggle={() => toggleGroup(column.id)}
            onOpenTask={onOpenTask}
            onDeleteTask={onDeleteTask}
            onAddTask={() => onAddTask(column.id)}
            onUpdateTask={onUpdateTask}
            onDuplicateTask={onDuplicateTask}
          />
        ))}
      </div>
    </DndContext>
  );
}

function TaskGroup({
  column, tasks, visibleFields, projectMembers, collapsed, onToggle,
  onOpenTask, onDeleteTask, onAddTask, onUpdateTask, onDuplicateTask,
}: {
  column: KanbanColumn;
  tasks: MockTask[];
  visibleFields: FieldVisibility;
  projectMembers: ProjectMember[];
  collapsed: boolean;
  onToggle: () => void;
  onOpenTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onAddTask: () => void;
  onUpdateTask: (taskId: string, patch: UpdateTaskInput) => void;
  onDuplicateTask: (id: string) => void;
}) {
  const { setNodeRef: setDropRef } = useDroppable({
    id: `${column.id}-list-dropzone`,
    data: { type: 'column-drop-area', status: column.id },
  });

  return (
    <div>
      <button onClick={onToggle} className="mb-1.5 flex items-center gap-1.5 px-1 py-1 text-sm font-medium text-foreground">
        {collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
        {column.title}
        <span className="text-xs font-normal text-muted">{tasks.length}</span>
      </button>

      {!collapsed && (
        <div className="rounded-xl border border-border">
          <div className="flex items-center gap-3 rounded-t-xl border-b border-border bg-sidebar px-4 py-2.5 text-[13px] font-medium text-secondary">
            <span className="w-5" />
            <span className="flex-1">Task</span>
            {visibleFields.Status && <span className="w-24">Status</span>}
            {visibleFields.Priority && <span className="w-28">Priority</span>}
            {visibleFields.Members && <span className="w-20">Members</span>}
            {visibleFields['Due Date'] && <span className="w-32">Due Date</span>}
            {visibleFields.Labels && <span className="w-32">Labels</span>}
            {visibleFields.Reporter && <span className="w-32">Reporter</span>}
            <span className="w-12">Actions</span>
          </div>

          <div ref={setDropRef}>
            <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
              {tasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  visibleFields={visibleFields}
                  projectMembers={projectMembers}
                  onOpen={() => onOpenTask(task.id)}
                  onDelete={() => onDeleteTask(task.id)}
                  onUpdate={(patch) => onUpdateTask(task.id, patch)}
                  onDuplicate={() => onDuplicateTask(task.id)}
                />
              ))}
            </SortableContext>
          </div>

          <button onClick={onAddTask} className="flex w-full items-center gap-1.5 rounded-b-xl px-4 py-3 text-left text-xs text-muted hover:bg-sidebar-active hover:text-foreground">
            <Plus size={13} /> Add Task
          </button>
        </div>
      )}
    </div>
  );
}

function TaskRow({
  task, visibleFields, projectMembers, onOpen, onDelete, onUpdate, onDuplicate,
}: {
  task: MockTask;
  visibleFields: FieldVisibility;
  projectMembers: ProjectMember[];
  onOpen: () => void;
  onDelete: () => void;
  onUpdate: (patch: UpdateTaskInput) => void;
  onDuplicate: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: 'task', status: task.status },
  });
  const style = { transform: CSS.Transform.toString(transform), transition };

  const priority = PRIORITY_META[task.priority];
  const overdue = isOverdue(task.dueDate);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useClickOutside(menuRef, () => setMenuOpen(false));

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    setMenuOpen(false);
    if (window.confirm("Delete this task? This can't be undone.")) onDelete();
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onOpen}
      className={cn('group flex cursor-pointer items-center gap-3 border-b border-border px-4 py-3.5 text-sm last:border-b-0 hover:bg-sidebar-active/50', isDragging && 'opacity-50')}
    >
      <button {...attributes} {...listeners} onClick={(e) => e.stopPropagation()} className="w-5 shrink-0 cursor-grab text-muted opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing" aria-label="Drag to reorder">
        <GripVertical size={14} />
      </button>

      <span className="flex-1 truncate font-medium text-foreground">{task.title}</span>

      {visibleFields.Status && (
        <span className="flex w-24 items-center gap-1.5 text-secondary">
          <span className={cn('h-1.5 w-1.5 rounded-full', STATUS_META[task.status].dot)} />
          {STATUS_META[task.status].label}
        </span>
      )}

      {/* RESTORED — this whole block was missing */}
      {visibleFields.Priority && (
        <span className="w-28">
          <InlineQuickCell
            widthClass="w-40"
            trigger={
              task.priority !== 'no_priority' ? (
                <span className={cn('flex items-center gap-1', priority.textColor)}>
                  <PriorityIcon level={priority.level} colorClass={priority.textColor} size={12} />
                  {priority.label}
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-muted"><Plus size={12} /> Priority</span>
              )
            }
          >
            {(close) => (
              <>
                {PRIORITY_OPTIONS.map((opt) => (
                  <button key={opt.value} onClick={() => { onUpdate({ priority: opt.value as TaskPriority }); close(); }} className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-foreground hover:bg-sidebar-active">
                    {priorityLeading(opt)}
                    <span className="flex-1 text-left">{opt.label}</span>
                    {task.priority === opt.value && <Check size={13} className="text-accent" />}
                  </button>
                ))}
              </>
            )}
          </InlineQuickCell>
        </span>
      )}

      {visibleFields.Members && (
        <span className="w-20">
          <InlineQuickCell
            trigger={
              task.assignees.length > 0 ? (
                <div className="flex -space-x-1">
                  {task.assignees.slice(0, 2).map((a) => (
                    <Avatar key={a.id} name={a.name} avatarUrl={a.avatarUrl} initials={a.initials} size={24} className="border-2 border-card" />
                  ))}
                  {task.assignees.length > 2 && <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-card bg-sidebar-active text-[9px] text-secondary">+{task.assignees.length - 2}</div>}
                </div>
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-full border border-dashed border-border text-muted"><Plus size={12} /></div>
              )
            }
          >
            {() => (
              <>
                {projectMembers.map((m) => {
                  const selected = task.assignees.some((a) => a.id === m.id);
                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                        const nextIds = selected ? task.assignees.filter((a) => a.id !== m.id).map((a) => a.id) : [...task.assignees.map((a) => a.id), m.id];
                        onUpdate({ assigneeIds: nextIds });
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-sm text-foreground hover:bg-sidebar-active"
                    >
                      {m.username}
                      {selected && <Check size={13} className="text-accent" />}
                    </button>
                  );
                })}
              </>
            )}
          </InlineQuickCell>
        </span>
      )}

      {visibleFields['Due Date'] && (
        <span className="w-32">
          <InlineQuickCell
            widthClass="w-56"
            trigger={
              task.dueDate ? (
                <span className={cn(overdue ? 'text-date-overdue' : 'text-secondary')}>{formatDate(task.dueDate)}</span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-muted"><Plus size={12} /> Date</span>
              )
            }
          >
            {(close) => (
              <div className="flex flex-col gap-2">
                <input type="date" defaultValue={task.dueDate ?? ''} onChange={(e) => { onUpdate({ dueDate: e.target.value || null }); close(); }} className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-foreground outline-none" />
                {task.dueDate && <button onClick={() => { onUpdate({ dueDate: null }); close(); }} className="text-left text-xs text-destructive hover:underline">Clear date</button>}
              </div>
            )}
          </InlineQuickCell>
        </span>
      )}

      {visibleFields.Labels && (
        <span className="flex w-32 flex-wrap gap-1">
          {task.labels.length > 0 ? task.labels.slice(0, 2).map((l) => (
            <span key={l} className="flex items-center gap-0.5 rounded-full bg-chip-bg px-1.5 py-0.5 text-[10px] text-chip-text"><Tag size={9} /> {l}</span>
          )) : <span className="text-xs text-muted">—</span>}
        </span>
      )}

      {visibleFields.Reporter && <span className="w-32 truncate text-secondary">{task.reporter?.name ?? '—'}</span>}

      <div ref={menuRef} className="relative w-12 shrink-0">
        <button onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o); }} className="text-muted hover:text-foreground" aria-label="Row actions">
          <MoreHorizontal size={16} />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-full z-50 mt-1 w-32 rounded-xl border border-border bg-card p-1.5 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => { setMenuOpen(false); onDuplicate(); }} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-foreground hover:bg-sidebar-active"><Copy size={13} /> Duplicate</button>
            <button onClick={() => { setMenuOpen(false); onOpen(); }} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-foreground hover:bg-sidebar-active"><Pencil size={13} /> Edit</button>
            <button onClick={handleDelete} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-destructive hover:bg-sidebar-active"><Trash2 size={13} /> Delete</button>
          </div>
        )}
      </div>
    </div>
  );
}