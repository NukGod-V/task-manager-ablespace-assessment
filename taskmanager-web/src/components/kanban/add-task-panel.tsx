'use client';

import { useEffect, useState } from 'react';
import { X, Tag, Plus, Trash2, Link2, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SelectField } from '@/components/ui/select-field';
import { useTaskActions } from '@/components/layout/task-actions-context';
import { useActiveProject } from '@/components/providers/active-project-provider';
import { fetchProjects, type UiProject } from '@/lib/api';
import { getStoredUser, type AuthUser } from '@/lib/auth';
import { STATUS_OPTIONS, PRIORITY_OPTIONS, priorityLeading } from '@/lib/task-options';
import type { TaskStatus, TaskPriority } from '@/types/task';

interface AddTaskPanelProps {
  defaultStatus?: TaskStatus;
  onClose: () => void;
}

export function AddTaskPanel({ defaultStatus, onClose }: AddTaskPanelProps) {
  const { createTaskHandler } = useTaskActions();
  const { activeProject } = useActiveProject();

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  useEffect(() => { setCurrentUser(getStoredUser()); }, []);

  const [projects, setProjects] = useState<UiProject[]>([]);
  const [projectsLoaded, setProjectsLoaded] = useState(false);
  const [projectId, setProjectId] = useState<string>(activeProject?.id ?? '');
  const selectedProject = projects.find((p) => p.id === projectId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>(defaultStatus ?? 'todo');
  const [priority, setPriority] = useState<TaskPriority>('no_priority');
  const [dueDate, setDueDate] = useState('');
  const [assigneeId, setAssigneeId] = useState<string>('');

  const [labels, setLabels] = useState<string[]>([]);
  const [labelInput, setLabelInput] = useState('');
  const [resources, setResources] = useState<{ id: string; name: string; url: string }[]>([]);
  const [resourceName, setResourceName] = useState('');
  const [resourceUrl, setResourceUrl] = useState('');
  const [subtasks, setSubtasks] = useState<{ id: string; title: string; done: boolean }[]>([]);
  const [subtaskInput, setSubtaskInput] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects()
      .then((list) => { setProjects(list); if (!projectId && list.length > 0) setProjectId(activeProject?.id ?? list[0].id); })
      .catch(() => setError('Could not load your projects.'))
      .finally(() => setProjectsLoaded(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function addLabel() {
    const val = labelInput.trim();
    if (val && !labels.includes(val)) setLabels((prev) => [...prev, val]);
    setLabelInput('');
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

  async function handleCreate() {
    if (!title.trim()) { setError('Title is required.'); return; }
    if (!projectId) { setError('A project is required — every task belongs to one.'); return; }
    if (!createTaskHandler) { setError('Task creation isn\u2019t available right now.'); return; }
    setSubmitting(true);
    setError(null);
    try {
      await createTaskHandler(projectId, {
        title: title.trim(), description: description.trim() || undefined, status, priority,
        dueDate: dueDate || undefined, assigneeId: assigneeId || undefined,
        labels: labels.length > 0 ? labels : undefined,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create the task.');
      setSubmitting(false);
    }
  }

  const projectOptions = projects.map((p) => ({ value: p.id, label: p.name }));
  const assigneeOptions = [{ value: '', label: 'Unassigned' }, ...((selectedProject?.members ?? []).map((m) => ({ value: m.id, label: m.username })))];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="flex h-full w-[720px] max-w-full overflow-hidden bg-card shadow-lg">
        <div className="flex-1 overflow-y-auto border-r border-border p-6">
          <div className="mb-1 flex items-center gap-2 text-xs text-muted"><span>Tasks</span><span>/</span><span className="font-medium text-foreground">New Task</span></div>

          <div className="flex items-start gap-2">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" autoFocus className="flex-1 bg-transparent text-2xl font-semibold text-foreground outline-none placeholder:text-muted" />
            <button onClick={onClose} className="mt-1 shrink-0 text-muted hover:text-foreground" aria-label="Close"><X size={16} /></button>
          </div>

          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add a description..." rows={2} className="mt-2 w-full resize-none bg-transparent text-sm text-secondary outline-none placeholder:text-muted" />

          <div className="mt-6">
            <p className="mb-2 text-xs font-medium text-muted">Properties</p>
            <div className="flex flex-wrap gap-2">
              <div className="w-44">
                <SelectField label="Project" value={projectId} options={projectOptions} onChange={setProjectId}
                  renderTrigger={<span className="rounded-full border border-border px-2.5 py-1 text-xs text-foreground">{selectedProject?.name ?? (projectsLoaded ? 'Select project' : 'Loading…')}</span>} />
              </div>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="rounded-full border border-border bg-card px-2.5 py-1 text-xs text-foreground outline-none" />
            </div>
            {projectsLoaded && !projectId && <p className="mt-1 text-xs text-destructive">Every task needs a project — pick one above.</p>}
          </div>

          <div className="mt-4">
            <p className="mb-2 text-xs font-medium text-muted">Labels</p>
            <div className="flex flex-wrap items-center gap-1.5">
              {labels.map((label) => (
                <span key={label} className="flex items-center gap-1 rounded-full bg-chip-bg px-2 py-0.5 text-[11px] text-chip-text">
                  <Tag size={10} />{label}
                  <button onClick={() => setLabels((prev) => prev.filter((l) => l !== label))} aria-label={`Remove ${label}`}><X size={10} /></button>
                </span>
              ))}
              <input value={labelInput} onChange={(e) => setLabelInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addLabel())} placeholder="Add label..." className="w-24 rounded-full border border-dashed border-border bg-transparent px-2 py-0.5 text-[11px] text-foreground outline-none placeholder:text-muted" />
            </div>
          </div>

          <div className="mt-6">
            <p className="mb-2 text-xs font-medium text-muted">Resources</p>
            {resources.map((r) => (
              <div key={r.id} className="mb-1.5 flex items-center gap-2 rounded-lg border border-border px-3 py-2">
                <Link2 size={13} className="shrink-0 text-muted" />
                <span className="flex-1 truncate text-sm text-foreground">{r.name}</span>
                <button onClick={() => setResources((prev) => prev.filter((x) => x.id !== r.id))} className="text-muted hover:text-destructive" aria-label="Remove resource"><Trash2 size={13} /></button>
              </div>
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
            <div className="flex items-center gap-2 rounded-lg border border-dashed border-border px-3 py-3 text-xs text-muted"><MessageSquare size={14} /> Available once the task is created.</div>
          </div>
        </div>

        <div className="flex w-[280px] shrink-0 flex-col p-6">
          <button onClick={handleCreate} disabled={submitting} className="mb-6 w-full rounded-full bg-cta-primary py-2.5 text-sm font-medium text-cta-primary-foreground disabled:opacity-60">{submitting ? 'Creating…' : 'Create Task'}</button>
          {error && <p className="mb-4 text-xs text-destructive">{error}</p>}
          <p className="mb-3 text-xs font-medium text-muted">Details</p>
          <div className="flex flex-col gap-1">
            <SelectField label="Status" value={status} onChange={setStatus} options={STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label, leading: <span className={cn('h-2 w-2 rounded-full', o.dot)} /> }))} />
            <SelectField label="Project" value={projectId} onChange={setProjectId} options={projectOptions} />
            <SelectField label="Priority" value={priority} onChange={setPriority} options={PRIORITY_OPTIONS.map((o) => ({ value: o.value, label: o.label, leading: priorityLeading(o) }))} />
            <SelectField label="Members" value={assigneeId} onChange={setAssigneeId} options={assigneeOptions} />
            <div className="flex items-center justify-between rounded-lg px-2 py-2 text-sm">
              <span className="text-muted">Dates</span>
              <span className="text-foreground">{dueDate ? new Date(dueDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : 'No date'}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg px-2 py-2 text-sm">
              <span className="text-muted">Reporter</span>
              <span className="text-foreground">{currentUser?.username ?? '—'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}