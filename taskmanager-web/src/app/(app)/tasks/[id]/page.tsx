'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Lock, Eye, Share2, MoreHorizontal, Maximize2, Minimize2,
  Tag, X, Plus, Trash2, Link2, Send, Paperclip, Settings, Check, ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useClickOutside } from '@/hooks/use-click-outside';
import { SelectField } from '@/components/ui/select-field';
import { InlineQuickCell } from '@/components/kanban/inline-quick-cell';
import { PriorityIcon } from '@/components/icons/priority-icon';
import {
  fetchTask, updateTask, deleteTask, fetchProjects, fetchComments, postComment,
  type UiProject, type UiComment, type UpdateTaskInput,
} from '@/lib/api';
import { STATUS_OPTIONS, PRIORITY_OPTIONS, priorityLeading } from '@/lib/task-options';
import { PRIORITY_META } from '@/lib/task-meta';
import type { MockTask, TaskPriority } from '@/types/task';

interface LocalResource { id: string; name: string; url: string; }
interface LocalSubtask { id: string; title: string; done: boolean; priority: TaskPriority; assigneeId: string | null; dueDate: string | null; }
interface ActivityEntry { id: string; text: string; at: string; }

function chipDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}
function activityStamp() {
  return new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export default function TaskDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const taskId = params.id;

  const [task, setTask] = useState<MockTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projects, setProjects] = useState<UiProject[]>([]);
  const currentProject = projects.find((p) => p.id === task?.projectId);

  const [labels, setLabels] = useState<string[]>([]);
  const [labelInput, setLabelInput] = useState('');

  // Local-only, session-scoped — no Resource/Subtask table on the backend
  // yet. Functional while you're on this page; lost on navigating away.
  const [resources, setResources] = useState<LocalResource[]>([]);
  const [resourceName, setResourceName] = useState('');
  const [resourceUrl, setResourceUrl] = useState('');
  const [subtasksOpen, setSubtasksOpen] = useState(true);
  const [subtasks, setSubtasks] = useState<LocalSubtask[]>([]);
  const [subtaskInput, setSubtaskInput] = useState('');

  const [comments, setComments] = useState<UiComment[]>([]);
  const [commentDraft, setCommentDraft] = useState('');
  const [postingComment, setPostingComment] = useState(false);

  // Also local-only, per-task — NOT a project-wide log. Derived from real
  // edits made in this session; doesn't persist past a reload.
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  function logActivity(text: string) {
    setActivity((prev) => [...prev, { id: crypto.randomUUID(), text, at: activityStamp() }]);
  }

  const [layoutMode, setLayoutMode] = useState<'full' | 'sidebar'>('full');
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  useClickOutside(moreMenuRef, () => setMoreMenuOpen(false));
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [loadedTask, loadedProjects, loadedComments] = await Promise.all([
          fetchTask(taskId),
          fetchProjects(),
          fetchComments(taskId).catch(() => []),
        ]);
        if (cancelled) return;
        setTask(loadedTask);
        setTitle(loadedTask.title);
        setDescription(loadedTask.description ?? '');
        setLabels(loadedTask.labels);
        setProjects(loadedProjects);
        setComments(loadedComments);
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : '';
        if (message.includes('404')) setNotFound(true);
        else setError(message || 'Could not load this task.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [taskId]);

  async function saveField(patch: UpdateTaskInput) {
    if (!task) return;
    try {
      const saved = await updateTask(task.id, patch);
      setTask(saved);
    } catch {
      setError('Could not save that change.');
    }
  }

  function handleTitleBlur() {
    if (task && title.trim() && title !== task.title) {
      saveField({ title: title.trim() });
      logActivity('You updated the title');
    }
  }
  function handleDescriptionBlur() {
    if (task && description !== (task.description ?? '')) {
      saveField({ description: description || null });
      logActivity('You updated the description');
    }
  }
  function handleStatusChange(value: MockTask['status']) {
    if (!task) return;
    const fromLabel = STATUS_OPTIONS.find((o) => o.value === task.status)?.label ?? task.status;
    const toLabel = STATUS_OPTIONS.find((o) => o.value === value)?.label ?? value;
    saveField({ status: value });
    logActivity(`You changed status from ${fromLabel} to ${toLabel}`);
  }
  function handlePriorityChange(value: TaskPriority) {
    if (!task) return;
    const fromLabel = PRIORITY_META[task.priority].label;
    const toLabel = PRIORITY_META[value].label;
    saveField({ priority: value });
    logActivity(`You changed priority from ${fromLabel} to ${toLabel}`);
  }
  function handleAssigneeChange(value: string) {
    saveField({ assigneeId: value || null });
    logActivity(value ? 'You changed the assignee' : 'You unassigned this task');
  }
  function handleDueDateChange(value: string | null) {
    saveField({ dueDate: value });
    logActivity(value ? 'You updated the due date' : 'You cleared the due date');
  }
  function handleProjectChange(value: string) {
    saveField({ projectId: value });
    logActivity('You moved this task to a different project');
  }

  function addLabel() {
    const val = labelInput.trim();
    if (val && !labels.includes(val)) {
      const next = [...labels, val];
      setLabels(next);
      saveField({ labels: next });
      logActivity(`You added the "${val}" label`);
    }
    setLabelInput('');
  }
  function removeLabel(label: string) {
    const next = labels.filter((l) => l !== label);
    setLabels(next);
    saveField({ labels: next });
    logActivity(`You removed the "${label}" label`);
  }

  function addResource() {
    if (!resourceName.trim() || !resourceUrl.trim()) return;
    setResources((prev) => [...prev, { id: crypto.randomUUID(), name: resourceName.trim(), url: resourceUrl.trim() }]);
    setResourceName(''); setResourceUrl('');
  }
  function addSubtask() {
    const val = subtaskInput.trim();
    if (!val) return;
    setSubtasks((prev) => [...prev, { id: crypto.randomUUID(), title: val, done: false, priority: 'no_priority', assigneeId: null, dueDate: null }]);
    setSubtaskInput('');
  }
  function updateSubtask(id: string, patch: Partial<LocalSubtask>) {
    setSubtasks((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  async function handlePostComment() {
    if (!commentDraft.trim()) return;
    setPostingComment(true);
    try {
      const created = await postComment(taskId, commentDraft.trim());
      setComments((prev) => [...prev, created]);
      setCommentDraft('');
    } catch {
      setError('Could not post that comment.');
    } finally {
      setPostingComment(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Delete this task? This can't be undone.")) return;
    try {
      await deleteTask(taskId);
      router.push('/tasks');
    } catch {
      setError('Could not delete this task.');
    }
  }

  function handleShare() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  }

  if (loading) return <p className="text-sm text-muted">Loading task…</p>;

  if (notFound || !task) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-sm text-muted">This task doesn't exist or you don't have access to it.</p>
        <button onClick={() => router.push('/tasks')} className="flex items-center gap-1 text-sm text-accent"><ArrowLeft size={14} /> Back to Tasks</button>
      </div>
    );
  }

  const projectOptions = projects.map((p) => ({ value: p.id, label: p.name }));
  const memberOptions = currentProject?.members ?? [];

  const detailContent = (
    <>
      {error && <p className="mb-3 rounded-lg bg-date-overdue-bg px-3 py-2 text-xs text-date-overdue">{error}</p>}

      <div className="mb-4 flex items-center justify-between">
        <button onClick={() => router.push('/tasks')} className="flex items-center gap-1 text-xs text-secondary hover:text-foreground"><ArrowLeft size={13} /> Tasks</button>

        <div className="flex items-center gap-3 text-secondary">
          <span title="Locked (decorative)"><Lock size={15} /></span>
          <span className="flex items-center gap-1 text-xs" title="Watchers (decorative)"><Eye size={15} />1</span>
          <button onClick={handleShare} className="hover:text-foreground" title="Copy link to this task"><Share2 size={15} /></button>
          {linkCopied && <span className="text-xs text-accent">Copied!</span>}

          <div ref={moreMenuRef} className="relative">
            <button onClick={() => setMoreMenuOpen((o) => !o)} className="hover:text-foreground" aria-label="More options"><MoreHorizontal size={15} /></button>
            {moreMenuOpen && (
              <div className="absolute right-0 top-full z-50 mt-1 w-36 rounded-xl border border-border bg-card p-1.5 shadow-lg">
                <button onClick={handleDelete} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-destructive hover:bg-sidebar-active"><Trash2 size={13} /> Delete Task</button>
              </div>
            )}
          </div>

          <button
            onClick={() => setLayoutMode((m) => (m === 'full' ? 'sidebar' : 'full'))}
            className="hover:text-foreground"
            title={layoutMode === 'full' ? 'Collapse to side panel' : 'Expand to full screen'}
          >
            {layoutMode === 'full' ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </div>

      <div className="flex flex-1 gap-8 overflow-hidden">
        {/* --- Left column --- */}
        <div className="flex-1 overflow-y-auto pb-8">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            className="w-full bg-transparent text-2xl font-semibold text-foreground outline-none"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={handleDescriptionBlur}
            placeholder="Add a description..."
            rows={2}
            className="mt-1.5 w-full resize-none bg-transparent text-sm leading-relaxed text-secondary outline-none placeholder:text-muted"
          />

          {/* Properties: assignee + due date chips, label:content row layout matching Figma */}
          <div className="mt-6 flex items-center gap-4">
            <span className="w-24 shrink-0 text-sm font-medium text-secondary">Properties</span>
            <div className="flex flex-1 flex-wrap items-center gap-2">
              <InlineQuickCell
                trigger={
                  task.assignee ? (
                    <span className="flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs text-foreground">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[8px] text-white">{task.assignee.initials}</span>
                      {task.assignee.role}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 rounded-full border border-dashed border-border px-2.5 py-1 text-xs text-muted"><Plus size={11} /> Assignee</span>
                  )
                }
              >
                {(close) => (
                  <>
                    <button onClick={() => { handleAssigneeChange(''); close(); }} className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-sm text-foreground hover:bg-sidebar-active">
                      Unassigned {!task.assigneeId && <Check size={13} className="text-accent" />}
                    </button>
                    {memberOptions.map((m) => (
                      <button key={m.id} onClick={() => { handleAssigneeChange(m.id); close(); }} className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-sm text-foreground hover:bg-sidebar-active">
                        {m.username} {task.assigneeId === m.id && <Check size={13} className="text-accent" />}
                      </button>
                    ))}
                  </>
                )}
              </InlineQuickCell>

              <InlineQuickCell
                widthClass="w-56"
                trigger={
                  task.dueDate ? (
                    <span className="flex items-center gap-1 rounded-full bg-date-overdue-bg px-2.5 py-1 text-xs text-date-overdue">{chipDate(task.dueDate)}</span>
                  ) : (
                    <span className="flex items-center gap-1 rounded-full border border-dashed border-border px-2.5 py-1 text-xs text-muted"><Plus size={11} /> Date</span>
                  )
                }
              >
                {(close) => (
                  <div className="flex flex-col gap-2">
                    <input type="date" defaultValue={task.dueDate ?? ''} onChange={(e) => { handleDueDateChange(e.target.value || null); close(); }} className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-foreground outline-none" />
                    {task.dueDate && <button onClick={() => { handleDueDateChange(null); close(); }} className="text-left text-xs text-destructive hover:underline">Clear date</button>}
                  </div>
                )}
              </InlineQuickCell>
            </div>
          </div>

          {/* Labels: row label on left, chips + add-input on right, same row */}
          <div className="mt-4 flex items-start gap-4">
            <span className="w-24 shrink-0 pt-1 text-sm font-medium text-secondary">Labels</span>
            <div className="flex flex-1 flex-wrap items-center gap-1.5">
              {labels.map((label) => (
                <span key={label} className="group flex items-center gap-1 rounded-full bg-chip-bg px-2 py-0.5 text-[11px] text-chip-text">
                  <Tag size={10} />
                  {label}
                  <button onClick={() => removeLabel(label)} aria-label={`Remove ${label}`} className="opacity-0 transition-opacity group-hover:opacity-100">
                    <X size={10} />
                  </button>
                </span>
              ))}
              <input
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addLabel())}
                placeholder="Add label..."
                className="w-24 rounded-full border border-dashed border-border bg-transparent px-2 py-0.5 text-[11px] text-foreground outline-none placeholder:text-muted"
              />
            </div>
          </div>

          {/* Resources: "Name : url", name is the clickable link, hover reveals delete */}
          <div className="mt-4 flex items-start gap-4">
            <span className="w-24 shrink-0 pt-1 text-sm font-medium text-secondary">Resources</span>
            <div className="flex-1">
              {resources.map((r) => (
                <div key={r.id} className="group mb-1.5 flex items-center gap-2 text-sm">
                  <Link2 size={13} className="shrink-0 text-muted" />
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="font-medium text-accent underline">{r.name}</a>
                  <span className="truncate text-xs text-muted">: {r.url}</span>
                  <button onClick={() => setResources((prev) => prev.filter((x) => x.id !== r.id))} className="text-muted opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100" aria-label="Remove resource">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <input value={resourceName} onChange={(e) => setResourceName(e.target.value)} placeholder="Name" className="w-1/3 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted" />
                <input value={resourceUrl} onChange={(e) => setResourceUrl(e.target.value)} placeholder="Paste a link..." className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted" />
                <button onClick={addResource} className="flex items-center gap-1 rounded-lg bg-cta-primary px-3 text-xs font-medium text-cta-primary-foreground"><Plus size={12} /> Add</button>
              </div>
            </div>
          </div>

          {/* Subtasks — table matching reference columns, now with real Priority/Members/Due Date pickers */}
          <div className="mt-6">
            <button onClick={() => setSubtasksOpen((o) => !o)} className="mb-2 flex items-center gap-1.5 text-sm font-medium text-secondary">
              <ChevronDown size={13} className={cn('transition-transform', !subtasksOpen && '-rotate-90')} />
              Subtasks {subtasks.length > 0 && `${subtasks.filter((s) => s.done).length}/${subtasks.length} done`}
            </button>
            {subtasksOpen && (
              <div className="rounded-lg border border-border">
                <div className="flex items-center gap-2 border-b border-border px-3 py-2 text-xs font-medium text-secondary">
                  <span className="w-4" />
                  <span className="flex-1">Task</span>
                  <span className="w-24">Priority</span>
                  <span className="w-16">Members</span>
                  <span className="w-20">Due Date</span>
                  <span className="w-8">Actions</span>
                </div>
                {subtasks.map((s) => {
                  const p = PRIORITY_META[s.priority];
                  const assignedMember = memberOptions.find((m) => m.id === s.assigneeId);
                  return (
                    <div key={s.id} className="flex items-center gap-2 border-b border-border px-3 py-2 text-sm last:border-b-0">
                      <input type="checkbox" checked={s.done} onChange={() => updateSubtask(s.id, { done: !s.done })} className="h-3.5 w-3.5 accent-accent" />
                      <span className={cn('flex-1 text-foreground', s.done && 'text-muted line-through')}>{s.title}</span>

                      <span className="w-24">
                        <InlineQuickCell widthClass="w-36" trigger={
                          s.priority !== 'no_priority' ? <span className={cn('flex items-center gap-1 text-xs', p.textColor)}><PriorityIcon level={p.level} colorClass={p.textColor} size={11} />{p.label}</span> : <span className="flex items-center gap-1 text-xs text-muted"><Plus size={11} /></span>
                        }>
                          {(close) => (
                            <>
                              {PRIORITY_OPTIONS.map((opt) => (
                                <button key={opt.value} onClick={() => { updateSubtask(s.id, { priority: opt.value as TaskPriority }); close(); }} className="flex w-full items-center gap-2 rounded-lg px-2 py-1 text-xs text-foreground hover:bg-sidebar-active">
                                  {priorityLeading(opt)}{opt.label}
                                </button>
                              ))}
                            </>
                          )}
                        </InlineQuickCell>
                      </span>

                      <span className="w-16">
                        <InlineQuickCell trigger={
                          assignedMember ? <div className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[9px] text-white">{assignedMember.username[0]?.toUpperCase()}</div> : <div className="flex h-5 w-5 items-center justify-center rounded-full border border-dashed border-border text-muted"><Plus size={10} /></div>
                        }>
                          {(close) => (
                            <>
                              <button onClick={() => { updateSubtask(s.id, { assigneeId: null }); close(); }} className="flex w-full items-center rounded-lg px-2 py-1 text-xs text-foreground hover:bg-sidebar-active">Unassigned</button>
                              {memberOptions.map((m) => (
                                <button key={m.id} onClick={() => { updateSubtask(s.id, { assigneeId: m.id }); close(); }} className="flex w-full items-center rounded-lg px-2 py-1 text-xs text-foreground hover:bg-sidebar-active">{m.username}</button>
                              ))}
                            </>
                          )}
                        </InlineQuickCell>
                      </span>

                      <span className="w-20">
                        <InlineQuickCell widthClass="w-44" trigger={
                          s.dueDate ? <span className="text-xs text-secondary">{chipDate(s.dueDate)}</span> : <span className="text-xs text-muted"><Plus size={11} /></span>
                        }>
                          {(close) => <input type="date" defaultValue={s.dueDate ?? ''} onChange={(e) => { updateSubtask(s.id, { dueDate: e.target.value || null }); close(); }} className="rounded-lg border border-border bg-background px-2 py-1 text-xs text-foreground outline-none" />}
                        </InlineQuickCell>
                      </span>

                      <button onClick={() => setSubtasks((prev) => prev.filter((x) => x.id !== s.id))} className="w-8 text-muted hover:text-destructive" aria-label="Remove subtask"><Trash2 size={13} /></button>
                    </div>
                  );
                })}
                <div className="flex items-center gap-2 px-3 py-2">
                  <input value={subtaskInput} onChange={(e) => setSubtaskInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtask())} placeholder="Add a subtask..." className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted" />
                  <button onClick={addSubtask} className="text-muted hover:text-foreground" aria-label="Add subtask"><Plus size={14} /></button>
                </div>
              </div>
            )}
          </div>

          {/* Comments */}
          <div className="mt-6">
            <p className="mb-2 text-sm font-medium text-secondary">Comments</p>
            <div className="flex flex-col gap-3">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-2">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-[10px] text-white">{c.author[0]?.toUpperCase() ?? '?'}</div>
                  <div>
                    <p className="text-xs font-medium text-foreground">{c.author} <span className="font-normal text-muted">· {new Date(c.createdAt).toLocaleString()}</span></p>
                    <p className="text-sm text-secondary">{c.body}</p>
                  </div>
                </div>
              ))}
              {comments.length === 0 && <p className="text-xs text-muted">No comments yet.</p>}
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-border px-3 py-2">
              <input value={commentDraft} onChange={(e) => setCommentDraft(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handlePostComment()} placeholder="Add a comment..." className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted" />
              <button disabled title="Attachments coming soon" className="shrink-0 text-muted opacity-50"><Paperclip size={14} /></button>
              <button onClick={handlePostComment} disabled={postingComment} className="shrink-0 text-muted hover:text-foreground disabled:opacity-50" aria-label="Send"><Send size={14} /></button>
            </div>
          </div>
        </div>

        {/* --- Right column: Details --- */}
        <div className="w-[300px] shrink-0 overflow-y-auto">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-secondary">Details</p>
            <div className="flex items-center gap-2 text-muted">
              <button title="Add field (coming soon)" className="hover:text-foreground"><Plus size={14} /></button>
              <button title="Field settings (coming soon)" className="hover:text-foreground"><Settings size={14} /></button>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <SelectField label="Status" value={task.status} onChange={handleStatusChange}
              options={STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label, leading: <span className={cn('h-2 w-2 rounded-full', o.dot)} /> }))} />

            <SelectField label="Project" value={task.projectId ?? ''} onChange={handleProjectChange} options={projectOptions} />

            <SelectField label="Priority" value={task.priority} onChange={handlePriorityChange}
              options={PRIORITY_OPTIONS.map((o) => ({ value: o.value, label: o.label, leading: priorityLeading(o) }))} />

            <SelectField label="Members" value={task.assigneeId ?? ''} onChange={handleAssigneeChange}
              options={[{ value: '', label: 'Unassigned' }, ...memberOptions.map((m) => ({ value: m.id, label: m.username }))]} />

            <div className="flex items-center justify-between rounded-lg px-2 py-2 text-sm">
              <span className="text-secondary">Dates</span>
              <input type="date" value={task.dueDate ?? ''} onChange={(e) => handleDueDateChange(e.target.value || null)} className="bg-transparent text-xs text-foreground outline-none" />
            </div>

            <div className="flex items-center justify-between rounded-lg px-2 py-2 text-sm">
              <span className="text-secondary">Labels</span>
              <span className="text-xs text-muted">{labels.length > 0 ? `${labels.length} label${labels.length === 1 ? '' : 's'}` : 'None'}</span>
            </div>

            <div className="flex items-center justify-between rounded-lg px-2 py-2 text-sm">
              <span className="text-secondary">Teams</span>
              <span className="text-xs text-muted">—</span>
            </div>

            <div className="flex items-center justify-between rounded-lg px-2 py-2 text-sm">
              <span className="text-secondary">Reporter</span>
              <span className="text-foreground">{task.reporter?.name ?? '—'}</span>
            </div>
          </div>

          <p className="mb-2 mt-6 text-sm font-medium text-secondary">Updates</p>
          <div className="flex flex-col gap-2">
            {activity.length === 0 && <p className="text-xs text-muted">No changes yet this session.</p>}
            {activity.map((a) => (
              <p key={a.id} className="text-xs text-muted">{a.text} · {a.at}</p>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  if (layoutMode === 'sidebar') {
    return (
      <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={() => router.push('/tasks')}>
        <div onClick={(e) => e.stopPropagation()} className="flex h-full w-[720px] max-w-full flex-col overflow-y-auto bg-card p-6 shadow-lg">
          {detailContent}
        </div>
      </div>
    );
  }

  return <div className="flex h-full flex-col">{detailContent}</div>;
}