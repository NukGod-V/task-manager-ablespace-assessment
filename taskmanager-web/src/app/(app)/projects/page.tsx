'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, Users, Crown, UserPlus } from 'lucide-react';
import { fetchProjects, createProject, fetchUsers, addProjectMember, removeProjectMember, type UiProject, type UiAppUser } from '@/lib/api';
import { useActiveProject } from '@/components/providers/active-project-provider';
import { getStoredUser, type AuthUser } from '@/lib/auth';

export default function ProjectsPage() {
  const router = useRouter();
  const { setActiveProject } = useActiveProject();
  const [projects, setProjects] = useState<UiProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [manageProject, setManageProject] = useState<UiProject | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  useEffect(() => { setCurrentUser(getStoredUser()); }, []);
  useEffect(() => {
    fetchProjects().then(setProjects).catch(() => setError('Could not load projects. Is the API running on :4000?')).finally(() => setLoading(false));
  }, []);

  function handleOpenProject(project: UiProject) {
    setActiveProject({ id: project.id, name: project.name });
    router.push('/tasks');
  }
  function handleCreated(project: UiProject) {
    setProjects((prev) => [project, ...prev]);
    setCreateModalOpen(false);
  }
  function handleMembersChanged(updated: UiProject) {
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setManageProject(updated);
  }

  if (loading) return <p className="text-sm text-muted">Loading projects…</p>;

  return (
    <div>
      {error && <p className="mb-3 rounded-lg bg-date-overdue-bg px-3 py-2 text-xs text-date-overdue">{error}</p>}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted">{projects.length} project{projects.length === 1 ? '' : 's'}</h2>
        <button onClick={() => setCreateModalOpen(true)} className="flex items-center gap-1 rounded-full bg-cta-primary px-4 py-1.5 text-sm font-medium text-cta-primary-foreground"><Plus size={14} /> Add Project</button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => {
          const isLead = project.lead?.id === currentUser?.id;
          return (
            <div key={project.id} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 text-left hover:border-accent">
              <button onClick={() => handleOpenProject(project)} className="text-left"><p className="text-sm font-medium text-foreground">{project.name}</p></button>
              {project.lead && <div className="flex items-center gap-1.5 text-xs text-muted"><Crown size={12} />{project.lead.id === currentUser?.id ? 'You' : project.lead.username}</div>}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-muted"><Users size={12} />{project.members.length} member{project.members.length === 1 ? '' : 's'}</div>
                {isLead && <button onClick={() => setManageProject(project)} className="flex items-center gap-1 text-xs text-accent hover:underline"><UserPlus size={12} /> Manage</button>}
              </div>
              <div className="flex -space-x-1.5">
                {project.members.slice(0, 5).map((m) => (
                  <div key={m.id} title={m.username ?? 'Unknown'} className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-card bg-accent text-[10px] text-white">{m.username?.[0]?.toUpperCase() ?? '?'}</div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {createModalOpen && <CreateProjectModal onClose={() => setCreateModalOpen(false)} onCreated={handleCreated} />}
      {manageProject && <ManageMembersModal project={manageProject} onClose={() => setManageProject(null)} onChanged={handleMembersChanged} />}
    </div>
  );
}

function CreateProjectModal({ onClose, onCreated }: { onClose: () => void; onCreated: (p: UiProject) => void }) {
  const [name, setName] = useState('');
  const [allUsers, setAllUsers] = useState<UiAppUser[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);

  useEffect(() => { setCurrentUserId(getStoredUser()?.id); }, []);
  useEffect(() => { if (currentUserId !== undefined) fetchUsers().then((users) => setAllUsers(users.filter((u) => u.id !== currentUserId))); }, [currentUserId]);

  function toggleMember(id: string) { setSelectedMembers((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id])); }

  async function handleSubmit() {
    if (!name.trim()) { setError('Project name is required.'); return; }
    setSubmitting(true); setError(null);
    try {
      const project = await createProject(name.trim(), selectedMembers);
      onCreated(project);
    } catch {
      setError('Could not create the project.');
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-[420px] rounded-xl border border-border bg-card p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between"><h2 className="text-sm font-semibold text-foreground">New Project</h2><button onClick={onClose} className="text-muted hover:text-foreground" aria-label="Close"><X size={16} /></button></div>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Project name..." autoFocus className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted" />
        {allUsers.length > 0 && (
          <div className="mt-4">
            <p className="mb-1.5 text-xs font-medium text-muted">Add members</p>
            <div className="max-h-40 overflow-y-auto rounded-lg border border-border">
              {allUsers.map((u) => (
                <label key={u.id} className="flex items-center justify-between px-3 py-2 text-sm text-foreground hover:bg-sidebar-active">{u.username}<input type="checkbox" checked={selectedMembers.includes(u.id)} onChange={() => toggleMember(u.id)} className="h-3.5 w-3.5 accent-accent" /></label>
              ))}
            </div>
          </div>
        )}
        {error && <p className="mt-3 text-xs text-destructive">{error}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-full border border-border px-4 py-2 text-sm text-foreground hover:bg-sidebar-active">Cancel</button>
          <button onClick={handleSubmit} disabled={submitting} className="rounded-full bg-cta-primary px-4 py-2 text-sm text-cta-primary-foreground disabled:opacity-60">{submitting ? 'Creating…' : 'Create'}</button>
        </div>
      </div>
    </div>
  );
}

// NEW — the backend already had addMember/removeMember endpoints from
// earlier work; this is the first UI that actually calls them.
function ManageMembersModal({ project, onClose, onChanged }: { project: UiProject; onClose: () => void; onChanged: (p: UiProject) => void }) {
  const [allUsers, setAllUsers] = useState<UiAppUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);
  const [addUserId, setAddUserId] = useState('');

  useEffect(() => { fetchUsers().then(setAllUsers); }, []);
  const nonMembers = allUsers.filter((u) => u.id !== project.lead?.id && !project.members.some((m) => m.id === u.id));

  async function handleAdd() {
    if (!addUserId) return;
    setBusyUserId(addUserId); setError(null);
    try {
      const updated = await addProjectMember(project.id, addUserId);
      onChanged(updated);
      setAddUserId('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add that member.');
    } finally { setBusyUserId(null); }
  }

  async function handleRemove(userId: string) {
    setBusyUserId(userId); setError(null);
    try {
      const updated = await removeProjectMember(project.id, userId);
      onChanged(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove that member.');
    } finally { setBusyUserId(null); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-[420px] rounded-xl border border-border bg-card p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between"><h2 className="text-sm font-semibold text-foreground">Manage members — {project.name}</h2><button onClick={onClose} className="text-muted hover:text-foreground" aria-label="Close"><X size={16} /></button></div>

        <p className="mb-1.5 text-xs font-medium text-muted">Current members</p>
        <div className="mb-4 rounded-lg border border-border">
          {project.lead && <div className="flex items-center justify-between px-3 py-2 text-sm"><span className="flex items-center gap-1.5 text-foreground"><Crown size={12} /> {project.lead.username}</span><span className="text-xs text-muted">Lead</span></div>}
          {project.members.filter((m) => m.id !== project.lead?.id).map((m) => (
            <div key={m.id} className="flex items-center justify-between border-t border-border px-3 py-2 text-sm">
              <span className="text-foreground">{m.username}</span>
              <button onClick={() => handleRemove(m.id)} disabled={busyUserId === m.id} className="text-xs text-destructive hover:underline disabled:opacity-50">{busyUserId === m.id ? 'Removing…' : 'Remove'}</button>
            </div>
          ))}
        </div>

        {nonMembers.length > 0 && (
          <>
            <p className="mb-1.5 text-xs font-medium text-muted">Add a member</p>
            <div className="flex gap-2">
              <select value={addUserId} onChange={(e) => setAddUserId(e.target.value)} className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none">
                <option value="">Select a user…</option>
                {nonMembers.map((u) => <option key={u.id} value={u.id}>{u.username}</option>)}
              </select>
              <button onClick={handleAdd} disabled={!addUserId || busyUserId === addUserId} className="rounded-lg bg-cta-primary px-3 text-xs font-medium text-cta-primary-foreground disabled:opacity-60">Add</button>
            </div>
          </>
        )}
        {error && <p className="mt-3 text-xs text-destructive">{error}</p>}
      </div>
    </div>
  );
}