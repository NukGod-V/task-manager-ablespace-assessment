'use client';

import { useRef, useState } from 'react';
import {
  X, Eye, Share2, MoreHorizontal, Lock, Tag, Plus, Send,
  Paperclip, ChevronDown, Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useClickOutside } from '@/hooks/use-click-outside';
import type { MockTask, TaskStatus, TaskPriority } from '@/types/task';

// Inferred colors — only "backlog" dot color was in the extraction doc (§1.1);
// the rest of the status/priority mapping is a reasonable extrapolation,
// not pulled from a confirmed Figma value.
export const STATUS_OPTIONS: { value: TaskStatus; label: string; dot: string }[] = [
  { value: 'backlog', label: 'Backlog', dot: 'bg-amber-500' },
  { value: 'todo', label: 'To Do', dot: 'bg-gray-400' },
  { value: 'doing', label: 'Doing', dot: 'bg-accent' },
  { value: 'completed', label: 'Completed', dot: 'bg-emerald-500' },
  { value: 'on_hold', label: 'On Hold', dot: 'bg-rose-500' },
];

export const PRIORITY_OPTIONS: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'no_priority', label: 'No Priority', color: 'bg-priority-none' },
  { value: 'urgent', label: 'Urgent', color: 'bg-priority-urgent' },
  { value: 'high', label: 'High', color: 'bg-priority-high' },
  { value: 'medium', label: 'Medium', color: 'bg-priority-medium' },
  { value: 'low', label: 'Low', color: 'bg-priority-low' },
];

interface Comment {
  id: string;
  author: string;
  body: string;
  timestamp: string;
}

interface TaskDetailProps {
  task: MockTask;
  onClose: () => void;
  onSave: (updated: MockTask) => void;
}

export function TaskDetail({ task, onClose, onSave }: TaskDetailProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? '');
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentDraft, setCommentDraft] = useState('');
  const [statusOpen, setStatusOpen] = useState(false);
  const [priorityOpen, setPriorityOpen] = useState(false);

  const statusRef = useRef<HTMLDivElement>(null);
  const priorityRef = useRef<HTMLDivElement>(null);
  useClickOutside(statusRef, () => setStatusOpen(false));
  useClickOutside(priorityRef, () => setPriorityOpen(false));

  const statusMeta = STATUS_OPTIONS.find((s) => s.value === status)!;
  const priorityMeta = PRIORITY_OPTIONS.find((p) => p.value === priority)!;

  function handleSave() {
    onSave({ ...task, title, description: description || null, status, priority });
    onClose();
  }

  function handlePostComment() {
    if (!commentDraft.trim()) return;
    setComments((prev) => [
      ...prev,
      { id: crypto.randomUUID(), author: 'You', body: commentDraft, timestamp: 'just now' },
    ]);
    setCommentDraft('');
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-[720px] max-w-full overflow-hidden bg-card shadow-lg"
      >
        {/* --- Left column --- */}
        <div className="flex-1 overflow-y-auto border-r border-border p-6">
          <div className="flex items-start gap-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 bg-transparent text-2xl font-semibold text-foreground outline-none"
            />
            <Lock size={16} className="mt-2 shrink-0 text-muted" />
            <div className="mt-1.5 flex shrink-0 items-center gap-1 text-xs text-muted">
              <Eye size={14} /> 1
            </div>
            <button className="mt-1 shrink-0 text-muted hover:text-foreground" aria-label="Share">
              <Share2 size={16} />
            </button>
            <button className="mt-1 shrink-0 text-muted hover:text-foreground" aria-label="More">
              <MoreHorizontal size={16} />
            </button>
            <button onClick={onClose} className="mt-1 shrink-0 text-muted hover:text-foreground" aria-label="Close">
              <X size={16} />
            </button>
          </div>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description..."
            rows={2}
            className="mt-2 w-full resize-none bg-transparent text-sm text-secondary outline-none placeholder:text-muted"
          />

          {/* Properties */}
          <div className="mt-6 flex flex-wrap gap-2">
            {task.assignee && (
              <span className="flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs text-foreground">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[8px] text-white">
                  {task.assignee.initials}
                </span>
                {task.assignee.role}
              </span>
            )}
            {task.dueDate && (
              <span className="rounded-full border border-border px-2.5 py-1 text-xs text-foreground">
                {new Date(task.dueDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
              </span>
            )}
          </div>

          {/* Labels */}
          <div className="mt-4">
            <p className="mb-2 text-xs font-medium text-muted">Labels</p>
            <div className="flex flex-wrap gap-1.5">
              {task.labels.map((label) => (
                <span key={label} className="flex items-center gap-1 rounded-full bg-chip-bg px-2 py-0.5 text-[11px] text-chip-text">
                  <Tag size={10} />
                  {label}
                </span>
              ))}
              <button className="flex items-center gap-1 rounded-full border border-dashed border-border px-2 py-0.5 text-[11px] text-muted hover:text-foreground">
                <Plus size={10} /> Add
              </button>
            </div>
          </div>

          {/* Resources */}
          <div className="mt-6">
            <p className="mb-2 text-xs font-medium text-muted">Resources</p>
            <input
              placeholder="Add document or link..."
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted"
            />
          </div>

          {/* Subtasks */}
          <div className="mt-6">
            <p className="mb-2 text-xs font-medium text-muted">Subtasks</p>
            <div className="rounded-lg border border-border">
              <div className="flex items-center gap-2 border-b border-border px-3 py-2 text-xs text-muted">
                <span className="w-4" />
                <span className="flex-1">Task</span>
                <span className="w-16">Priority</span>
                <span className="w-16">Due</span>
              </div>
              <button className="flex w-full items-center gap-2 px-3 py-2 text-xs text-muted hover:text-foreground">
                <Plus size={12} /> Add Subtask
              </button>
            </div>
          </div>

          {/* Comments */}
          <div className="mt-6">
            <p className="mb-2 text-xs font-medium text-muted">Comments</p>
            <div className="flex flex-col gap-3">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-2">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-[10px] text-white">
                    {c.author[0]}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-foreground">
                      {c.author} <span className="font-normal text-muted">· {c.timestamp}</span>
                    </p>
                    <p className="text-sm text-secondary">{c.body}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-border px-3 py-2">
              <input
                value={commentDraft}
                onChange={(e) => setCommentDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
                placeholder="Add a comment..."
                className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted"
              />
              <Paperclip size={14} className="shrink-0 text-muted" />
              <button onClick={handlePostComment} className="shrink-0 text-muted hover:text-foreground" aria-label="Send">
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* --- Right column: Details panel --- */}
        <div className="flex w-[280px] shrink-0 flex-col p-6">
          <button
            onClick={handleSave}
            className="mb-6 w-full rounded-full bg-cta-primary py-2.5 text-sm font-medium text-cta-primary-foreground"
          >
            Save
          </button>

          <p className="mb-3 text-xs font-medium text-muted">Details</p>
          <div className="flex flex-col gap-1">
            {/* Status */}
            <div ref={statusRef} className="relative">
              <button
                onClick={() => setStatusOpen((o) => !o)}
                className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-sm hover:bg-sidebar-active"
              >
                <span className="flex items-center gap-2 text-foreground">
                  <span className={cn('h-2 w-2 rounded-full', statusMeta.dot)} />
                  {statusMeta.label}
                </span>
                <ChevronDown size={14} className="text-muted" />
              </button>
              {statusOpen && (
                <div className="absolute left-0 top-full z-10 mt-1 w-full rounded-xl border border-border bg-card p-1.5 shadow-lg">
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setStatus(opt.value); setStatusOpen(false); }}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-foreground hover:bg-sidebar-active"
                    >
                      <span className={cn('h-2 w-2 rounded-full', opt.dot)} />
                      <span className="flex-1 text-left">{opt.label}</span>
                      {status === opt.value && <Check size={14} className="text-accent" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Priority — bar-chart-style swatch stands in for Figma's bar icon */}
            <div ref={priorityRef} className="relative">
              <button
                onClick={() => setPriorityOpen((o) => !o)}
                className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-sm hover:bg-sidebar-active"
              >
                <span className="flex items-center gap-2 text-foreground">
                  <span className={cn('h-2.5 w-1.5 rounded-sm', priorityMeta.color)} />
                  {priorityMeta.label}
                </span>
                <ChevronDown size={14} className="text-muted" />
              </button>
              {priorityOpen && (
                <div className="absolute left-0 top-full z-10 mt-1 w-full rounded-xl border border-border bg-card p-1.5 shadow-lg">
                  {PRIORITY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setPriority(opt.value); setPriorityOpen(false); }}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-foreground hover:bg-sidebar-active"
                    >
                      <span className={cn('h-2.5 w-1.5 rounded-sm', opt.color)} />
                      <span className="flex-1 text-left">{opt.label}</span>
                      {priority === opt.value && <Check size={14} className="text-accent" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Members — read-only display, single assignee in mock data */}
            <div className="flex items-center justify-between rounded-lg px-2 py-2 text-sm">
              <span className="text-muted">Members</span>
              {task.assignee ? (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[9px] text-white">
                  {task.assignee.initials}
                </span>
              ) : (
                <span className="text-muted">—</span>
              )}
            </div>

            {/* Dates — plain date input for now; full inline popover (§2.7) is future work */}
            <div className="flex items-center justify-between rounded-lg px-2 py-2 text-sm">
              <span className="text-muted">Dates</span>
              <span className="text-foreground">
                {task.dueDate
                  ? new Date(task.dueDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
                  : 'No date'}
              </span>
            </div>

            {/* Teams / Reporter — display-only stubs: no Team/Reporter model in Phase 1 schema yet */}
            <div className="flex items-center justify-between rounded-lg px-2 py-2 text-sm">
              <span className="text-muted">Teams</span>
              <span className="text-muted">—</span>
            </div>
            <div className="flex items-center justify-between rounded-lg px-2 py-2 text-sm">
              <span className="text-muted">Reporter</span>
              <span className="text-foreground">{task.reporter?.name ?? '—'}</span>
            </div>
          </div>

          {/* Updates — static mock, matches §2.7's activity-log format */}
          <p className="mb-2 mt-6 text-xs font-medium text-muted">Updates</p>
          <div className="flex flex-col gap-2 text-xs text-muted">
            <p>You changed priority from No priority to {priorityMeta.label} · Aug 2026</p>
            <p>You posted an update · Aug 2026</p>
          </div>
        </div>
      </div>
    </div>
  );
}