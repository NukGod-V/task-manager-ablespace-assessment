import { getAccessToken } from './auth';
import type { MockTask, TaskStatus, TaskPriority, TaskResource, TaskSubtask } from '@/types/task';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

interface ApiUser { id: string; username: string; authProvider: string; avatarUrl?: string | null; email?: string | null; fullName?: string | null; title?: string | null; }
interface ApiProject { id: string; name: string; workspaceId: string | null; lead: ApiUser | null; members: ApiUser[]; }
interface ApiTask {
  id: string; title: string; description: string | null; status: string; priority: string;
  position: number; dueDate: string | null; labels: string[] | null;
  resources: TaskResource[] | null; subtasks: TaskSubtask[] | null;
  owner: ApiUser; assignees: ApiUser[]; project: ApiProject | null;
}
interface ApiComment { id: string; body: string; createdAt: string; author: ApiUser; }
interface GuestLoginResponse { accessToken: string; user: { id: string; username: string; authProvider: string }; }

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers ?? {}) },
  });
  if (!res.ok) {
    let detail = '';
    try {
      const body = await res.json();
      detail = body?.message ? `: ${Array.isArray(body.message) ? body.message.join(', ') : body.message}` : '';
    } catch { /* not JSON */ }
    throw new Error(`API ${options.method ?? 'GET'} ${path} failed (${res.status})${detail}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export async function guestLogin(): Promise<GuestLoginResponse> {
  const res = await fetch(`${API_URL}/auth/guest`, { method: 'POST' });
  if (!res.ok) throw new Error(`Guest login failed: ${res.status}`);
  return res.json();
}

function mapApiTaskToUi(task: ApiTask): MockTask {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status as TaskStatus,
    priority: task.priority as TaskPriority,
    position: task.position,
    dueDate: task.dueDate,
    projectId: task.project?.id ?? null,
    assignees: (task.assignees ?? []).map((u) => ({ id: u.id, name: u.username, initials: u.username?.[0]?.toUpperCase() ?? '?', avatarUrl: u.avatarUrl ?? null })),
    labels: task.labels ?? [],
    resources: task.resources ?? [],
    subtasks: task.subtasks ?? [],
    reporter: task.owner ? { id: task.owner.id, name: task.owner.username, initials: task.owner.username?.[0]?.toUpperCase() ?? '?', avatarUrl: task.owner.avatarUrl ?? null } : null,
  };
}

export interface CreateTaskInput {
  title: string; description?: string; status?: TaskStatus; priority?: TaskPriority; dueDate?: string;
  assigneeIds?: string[]; labels?: string[]; resources?: TaskResource[]; subtasks?: TaskSubtask[];
}
export async function fetchTasks(projectId: string): Promise<MockTask[]> {
  const tasks = await apiFetch<ApiTask[]>(`/tasks?projectId=${projectId}`);
  return tasks.map(mapApiTaskToUi);
}
export async function fetchTask(id: string): Promise<MockTask> {
  return mapApiTaskToUi(await apiFetch<ApiTask>(`/tasks/${id}`));
}
export async function createTask(projectId: string, input: CreateTaskInput): Promise<MockTask> {
  return mapApiTaskToUi(await apiFetch<ApiTask>('/tasks', { method: 'POST', body: JSON.stringify({ ...input, projectId }) }));
}

export interface UpdateTaskInput {
  title?: string; description?: string | null; status?: TaskStatus; priority?: TaskPriority;
  dueDate?: string | null; projectId?: string | null; assigneeIds?: string[]; labels?: string[];
  resources?: TaskResource[]; subtasks?: TaskSubtask[];
}
export async function updateTask(id: string, input: UpdateTaskInput): Promise<MockTask> {
  return mapApiTaskToUi(await apiFetch<ApiTask>(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(input) }));
}
export async function deleteTask(id: string): Promise<void> {
  await apiFetch<void>(`/tasks/${id}`, { method: 'DELETE' });
}
export async function reorderTask(id: string, input: { status: TaskStatus; position: number }): Promise<MockTask> {
  return mapApiTaskToUi(await apiFetch<ApiTask>(`/tasks/${id}/reorder`, { method: 'PATCH', body: JSON.stringify(input) }));
}

export interface UiProject { id: string; name: string; lead: { id: string; username: string; avatarUrl?: string | null } | null; members: { id: string; username: string; avatarUrl?: string | null }[]; }
function mapApiProjectToUi(p: ApiProject): UiProject {
  return {
    id: p.id,
    name: p.name,
    lead: p.lead ? { id: p.lead.id, username: p.lead.username, avatarUrl: p.lead.avatarUrl ?? null } : null,
    members: (p.members ?? []).map((m) => ({ id: m.id, username: m.username, avatarUrl: m.avatarUrl ?? null })),
  };
}
export async function fetchProjects(): Promise<UiProject[]> {
  return (await apiFetch<ApiProject[]>('/projects')).map(mapApiProjectToUi);
}
export async function createProject(name: string, memberIds: string[] = []): Promise<UiProject> {
  return mapApiProjectToUi(await apiFetch<ApiProject>('/projects', { method: 'POST', body: JSON.stringify({ name, memberIds }) }));
}
export async function addProjectMember(projectId: string, userId: string): Promise<UiProject> {
  return mapApiProjectToUi(await apiFetch<ApiProject>(`/projects/${projectId}/members`, { method: 'POST', body: JSON.stringify({ userId }) }));
}
export async function removeProjectMember(projectId: string, userId: string): Promise<UiProject> {
  return mapApiProjectToUi(await apiFetch<ApiProject>(`/projects/${projectId}/members/${userId}`, { method: 'DELETE' }));
}

export interface UiAppUser { id: string; username: string; avatarUrl?: string | null; }
export async function fetchUsers(): Promise<UiAppUser[]> {
  return (await apiFetch<ApiUser[]>('/users')).map((u) => ({ id: u.id, username: u.username, avatarUrl: u.avatarUrl ?? null }));
}

export interface UpdateProfileInput { fullName?: string; title?: string; username?: string; avatarUrl?: string; }
export async function fetchCurrentUser() {
  return apiFetch<{ id: string; username: string; authProvider: string; fullName: string | null; title: string | null; email: string | null; avatarUrl: string | null }>('/auth/me');
}
export async function updateProfile(input: UpdateProfileInput) {
  return apiFetch<{ id: string; username: string; authProvider: string; fullName: string | null; title: string | null; avatarUrl: string | null }>('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export interface UiComment { id: string; author: string; authorAvatarUrl: string | null; body: string; createdAt: string; }
export async function fetchComments(taskId: string): Promise<UiComment[]> {
  return (await apiFetch<ApiComment[]>(`/tasks/${taskId}/comments`)).map((c) => ({
    id: c.id, author: c.author?.username ?? 'Unknown', authorAvatarUrl: c.author?.avatarUrl ?? null, body: c.body, createdAt: c.createdAt,
  }));
}
export async function postComment(taskId: string, body: string): Promise<UiComment> {
  const c = await apiFetch<ApiComment>(`/tasks/${taskId}/comments`, { method: 'POST', body: JSON.stringify({ body }) });
  return { id: c.id, author: c.author?.username ?? 'Unknown', authorAvatarUrl: c.author?.avatarUrl ?? null, body: c.body, createdAt: c.createdAt };
}