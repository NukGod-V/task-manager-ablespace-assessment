'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Lock, Eye, Share2, MoreHorizontal, PanelRightClose, PanelRightOpen,
  Tag, X, Plus, Trash2, Link2, Send,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useClickOutside } from '@/hooks/use-click-outside';
import { SelectField } from '@/components/ui/select-field';
import { fetchTask, updateTask, deleteTask, fetchProjects, fetchComments, postComment, type UiProject, type UiComment, type UpdateTaskInput } from '@/lib/api';
import { STATUS_OPTIONS, PRIORITY_OPTIONS, priorityLeading } from '@/lib/task-options';
import type { MockTask } from '@/types/task';

interface LocalResource { id: string; name: string; url: string; }
interface LocalSubtask { id: string; title: string; done: boolean; }

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

  // Local-only — no Resource/Subtask table on the backend yet. Functional
  // within this session; won't survive leaving the page. Flagged clearly
  // in this chat as a deliberate, deadline-driven scope decision.
  const [resources, setResources] = useState<LocalResource[]>([]);
  const [resourceName, setResourceName] = useState('');
  const [resourceUrl, setResourceUrl] = useState('');
  const [subtasks, setSubtasks] = useState<LocalSubtask[]>([]);
  const [subtaskInput, setSubtaskInput] = useState('');

  const [comments, setComments] = useState<UiComment[]>([]);
  const [commentDraft, setCommentDraft] = useState('');
  const [postingComment, setPostingComment] = useState(false);

  const [rightPanelOpen, setRightPanelOpen] = useState(true);
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

  // Fires one PATCH per discrete change — no explicit Save button, matching
  // the reference screenshot, which shows none.
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
    if (task && title.trim() && title !== task.title) saveField({ title: title.trim() });
  }
  function handleDescriptionBlur() {
    if (task && description !== (task.description ?? '')) saveField({ description: description || null });
  }

  function addLabel() {
    const val = labelInput.trim();
    if (val && !labels.includes(val)) {
      const next = [...labels, val];
      setLabels(next);
      saveField({ labels: next });
    }
    setLabelInput('');
  }
  function removeLabel(label: string) {
    const next = labels.filter((l) => l !== label);
    setLabels(next);
    saveField({ labels: next });
  }

  function addResource() {
    if (!resourceName.trim() || !resourceUrl.trim()) return;
    setResources((prev) => [...prev, { id: crypto.randomUUID(), name: resourceName.trim(), url: resourceUrl.trim() }]);
    setResourceName(''); setResourceUrl('');
  }
  function addSubtask() {
    const val = subtaskInput.trim();
    if (!val) return;
    setSubtasks((prev) => [...prev, { id: crypto.randomUUID(), title: val, done: false }]);
    setSubtaskInput('');
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

  const assigneeOptions = [{ value: '', label: 'Unassigned' }, ...((currentProject?.members ?? []).map((m) => ({ value: m.id, label: m.username })))];
  const projectOptions = projects.map((p) => ({ value: p.id, label: p.name }));

  return (
    <div className="flex h-full flex-col">
      {error && <p className="mb-3 rounded-lg bg-date-overdue-bg px-3 py-2 text-xs text-date-overdue">{error}</p>}

      <div className="mb-4 flex items-center justify-between">
        <button onClick={() => router.push('/tasks')} className="flex items-center gap-1 text-xs text-muted hover:text-foreground"><ArrowLeft size={13} /> Tasks</button>

        <div className="flex items-center gap-3 text-muted">
          {/* Decorative — no real lock/watcher feature exists; kept for visual fidelity to the reference */}
          <span title="Locked (decorative)"><Lock size={15} /></span>
          <span className="flex items-center gap-1 text-xs" title="Watchers (decorative)"><Eye size={15} />1</span>

          <button onClick={handleShare} className="flex items-center gap-1 hover:text-foreground" title="Copy link to this task"><Share2 size={15} /></button>
          {linkCopied && <span className="text-xs text-accent">Copied!</span>}

          <div ref={moreMenuRef} className="relative">
            <button onClick={() => setMoreMenuOpen((o) => !o)} className="hover:text-foreground" aria-label="More options"><MoreHorizontal size={15} /></button>
            {moreMenuOpen && (
              <div className="absolute right-0 top-full z-20 mt-1 w-36 rounded-xl border border-border bg-card p-1.5 shadow-lg">
                <button onClick={handleDelete} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-destructive hover:bg-sidebar-active"><Trash2 size={13} /> Delete Task</button>
              </div>
            )}
          </div>

          <button onClick={() => setRightPanelOpen((o) => !o)} className="hover:text-foreground" aria-label="Toggle details panel">
            {rightPanelOpen ? <PanelRightClose size={15} /> : <PanelRightOpen size={15} />}
          </button>
        </div>
      </div>

      <div className="flex flex-1 gap-8 overflow-hidden">
        <div className="flex-1 overflow-y-auto pb-8">
          <input value={title} onChange={(e) => setTitle(e.target.value)} onBlur={handleTitleBlur} className="w-full bg-transparent text-2xl font-semibold text-foreground outline-none" />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} onBlur={handleDescriptionBlur} placeholder="Add a description..." rows={2} className="mt-2 w-full resize-none bg-transparent text-sm text-secondary outline-none placeholder:text-muted" />

          <div className="mt-6">
            <p className="mb-2 text-xs font-medium text-muted">Labels</p>
            <div className="flex flex-wrap items-center gap-1.5">
              {labels.map((label) => (
                <span key={label} className="flex items-center gap-1 rounded-full bg-chip-bg px-2 py-0.5 text-[11px] text-chip-text">
                  <Tag size={10} />{label}
                  <button onClick={() => removeLabel(label)} aria-label={`Remove ${label}`}><X size={10} /></button>
                </span>
              ))}
              <input value={labelInput} onChange={(e) => setLabelInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addLabel())} placeholder="Add label..." className="w-24 rounded-full border border-dashed border-border bg-transparent px-2 py-0.5 text-[11px] text-foreground outline-none placeholder:text-muted" />
            </div>
          </div>

          <div className="mt-6">
            <p className="mb-2 text-xs font-medium text-muted">Resources</p>
            {resources.map((r) => (
              <a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer" className="mb-1.5 flex items-center gap-2 rounded-lg border border-border px-3 py-2 hover:bg-sidebar-active">
                <Link2 size={13} className="shrink-0 text-muted" />
                <span className="flex-1 truncate text-sm text-accent underline">{r.name}</span>
                <button onClick={(e) => { e.preventDefault(); setResources((prev) => prev.filter((x) => x.id !== r.id)); }} className="text-muted hover:text-destructive" aria-label="Remove resource"><Trash2 size={13} /></button>
              </a>
            ))}
            <div className="flex gap-2">
              <input value={resourceName} onChange={(e) => setResourceName(e.target.value)} placeholder="Name" className="w-1/3 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted" />
              <input value={resourceUrl} onChange={(e) => setResourceUrl(e.target.value)} placeholder="Paste a link..." className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted" />
              <button onClick={addResource} className="flex items-center gap-1 rounded-lg bg-cta-primary px-3 text-xs font-medium text-cta-primary-foreground"><Plus size={12} /> Add</button>
            </div>
          </div>

          <div className="mt-6">
            <p className="mb-2 text-xs font-medium text-muted">Subtasks {subtasks.length > 0 && `${subtasks.filter((s) => s.done).length}/${subtasks.length} done`}</p>
            <div className="rounded-lg border border-border">
              {subtasks.map((s) => (
                <div key={s.id} className="flex items-center gap-2 border-b border-border px-3 py-2 last:border-b-0">
                  <input type="checkbox" checked={s.done} onChange={() => setSubtasks((prev) => prev.map((x) => (x.id === s.id ? { ...x, done: !x.done } : x)))} className="h-3.5 w-3.5 accent-accent" />
                  <span className={cn('flex-1 text-sm text-foreground', s.done && 'text-muted line-through')}>{s.title}</span>
                  <button onClick={() => setSubtasks((prev) => prev.filter((x) => x.id !== s.id))} className="text-muted hover:text-destructive" aria-label="Remove subtask"><Trash2 size={13} /></button>
                </div>
              ))}
              <div className="flex items-center gap-2 px-3 py-2">
                <input value={subtaskInput} onChange={(e) => setSubtaskInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtask())} placeholder="Add a subtask..." className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted" />
                <button onClick={addSubtask} className="text-muted hover:text-foreground" aria-label="Add subtask"><Plus size={14} /></button>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <p className="mb-2 text-xs font-medium text-muted">Comments</p>
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
              <button onClick={handlePostComment} disabled={postingComment} className="shrink-0 text-muted hover:text-foreground disabled:opacity-50" aria-label="Send"><Send size={14} /></button>
            </div>
          </div>
        </div>

        {rightPanelOpen && (
          <div className="w-[280px] shrink-0 overflow-y-auto">
            <p className="mb-3 text-xs font-medium text-muted">Details</p>
            <div className="flex flex-col gap-1">
              <SelectField label="Status" value={task.status} onChange={(v) => saveField({ status: v })}
                options={STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label, leading: <span className={cn('h-2 w-2 rounded-full', o.dot)} /> }))} />
              <SelectField label="Project" value={task.projectId ?? ''} onChange={(v) => saveField({ projectId: v })} options={projectOptions} />
              <SelectField label="Priority" value={task.priority} onChange={(v) => saveField({ priority: v })}
                options={PRIORITY_OPTIONS.map((o) => ({ value: o.value, label: o.label, leading: priorityLeading(o) }))} />
              <SelectField label="Members" value={task.assigneeId ?? ''} onChange={(v) => saveField({ assigneeId: v || null })} options={assigneeOptions} />
              <div className="flex items-center justify-between rounded-lg px-2 py-2 text-sm">
                <span className="text-muted">Dates</span>
                <input type="date" value={task.dueDate ?? ''} onChange={(e) => saveField({ dueDate: e.target.value || null })} className="bg-transparent text-xs text-foreground outline-none" />
              </div>
              <div className="flex items-center justify-between rounded-lg px-2 py-2 text-sm">
                <span className="text-muted">Reporter</span>
                <span className="text-foreground">{task.reporter?.name ?? '—'}</span>
              </div>
            </div>

            <p className="mb-2 mt-6 text-xs font-medium text-muted">Updates</p>
            <div className="flex flex-col gap-2 text-xs text-muted"><p>Activity log — coming soon.</p></div>
          </div>
        )}
      </div>
    </div>
  );
}