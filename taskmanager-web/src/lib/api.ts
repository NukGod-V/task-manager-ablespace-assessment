import { getAccessToken } from './auth';
import type { MockTask, TaskStatus, TaskPriority } from '@/types/task';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

interface ApiUser { id: string; username: string; authProvider: string; }
interface ApiProject { id: string; name: string; workspaceId: string | null; lead: ApiUser | null; members: ApiUser[]; }
interface ApiTask {
  id: string; title: string; description: string | null; status: string; priority: string;
  position: number; dueDate: string | null; labels: string[] | null;
  owner: ApiUser; assignee: ApiUser | null; project: ApiProject | null;
}
interface ApiComment { id: string; body: string; createdAt: string; author: ApiUser; }
interface GuestLoginResponse { accessToken: string; user: { id: string; username: string; authProvider: string }; }

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
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
    assignee: task.assignee
      ? { name: task.assignee.username, role: 'Member', initials: task.assignee.username?.[0]?.toUpperCase() ?? '?' }
      : null,
    assigneeId: task.assignee?.id ?? null, // NEW
    labels: task.labels ?? [],
    reporter: task.owner
      ? { name: task.owner.username, initials: task.owner.username?.[0]?.toUpperCase() ?? '?' }
      : null,
  };
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  assigneeId?: string;
  labels?: string[];
}

export async function fetchTasks(projectId: string): Promise<MockTask[]> {
  const tasks = await apiFetch<ApiTask[]>(`/tasks?projectId=${projectId}`);
  return tasks.map(mapApiTaskToUi);
}

export async function fetchTask(id: string): Promise<MockTask> {
  const task = await apiFetch<ApiTask>(`/tasks/${id}`);
  return mapApiTaskToUi(task);
}

export async function createTask(projectId: string, input: CreateTaskInput): Promise<MockTask> {
  const task = await apiFetch<ApiTask>('/tasks', { method: 'POST', body: JSON.stringify({ ...input, projectId }) });
  return mapApiTaskToUi(task);
}

export interface UpdateTaskInput {
  title?: string; description?: string | null; status?: TaskStatus; priority?: TaskPriority;
  dueDate?: string | null; projectId?: string | null; assigneeId?: string | null; labels?: string[];
}

export async function updateTask(id: string, input: UpdateTaskInput): Promise<MockTask> {
  const task = await apiFetch<ApiTask>(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(input) });
  return mapApiTaskToUi(task);
}

export async function deleteTask(id: string): Promise<void> {
  await apiFetch<void>(`/tasks/${id}`, { method: 'DELETE' });
}

export async function reorderTask(id: string, input: { status: TaskStatus; position: number }): Promise<MockTask> {
  const task = await apiFetch<ApiTask>(`/tasks/${id}/reorder`, { method: 'PATCH', body: JSON.stringify(input) });
  return mapApiTaskToUi(task);
}

export interface UiProject { id: string; name: string; lead: { id: string; username: string } | null; members: { id: string; username: string }[]; }

function mapApiProjectToUi(p: ApiProject): UiProject {
  return {
    id: p.id,
    name: p.name,
    lead: p.lead ? { id: p.lead.id, username: p.lead.username } : null,
    members: (p.members ?? []).map((m) => ({ id: m.id, username: m.username })),
  };
}

export async function fetchProjects(): Promise<UiProject[]> {
  const projects = await apiFetch<ApiProject[]>('/projects');
  return projects.map(mapApiProjectToUi);
}

export async function createProject(name: string, memberIds: string[] = []): Promise<UiProject> {
  const project = await apiFetch<ApiProject>('/projects', { method: 'POST', body: JSON.stringify({ name, memberIds }) });
  return mapApiProjectToUi(project);
}

export async function addProjectMember(projectId: string, userId: string): Promise<UiProject> {
  const project = await apiFetch<ApiProject>(`/projects/${projectId}/members`, { method: 'POST', body: JSON.stringify({ userId }) });
  return mapApiProjectToUi(project);
}

export async function removeProjectMember(projectId: string, userId: string): Promise<UiProject> {
  const project = await apiFetch<ApiProject>(`/projects/${projectId}/members/${userId}`, { method: 'DELETE' });
  return mapApiProjectToUi(project);
}

export interface UiAppUser { id: string; username: string; }

export async function fetchUsers(): Promise<UiAppUser[]> {
  const users = await apiFetch<ApiUser[]>('/users');
  return users.map((u) => ({ id: u.id, username: u.username }));
}

export interface UiComment { id: string; author: string; body: string; createdAt: string; }

export async function fetchComments(taskId: string): Promise<UiComment[]> {
  const comments = await apiFetch<ApiComment[]>(`/tasks/${taskId}/comments`);
  return comments.map((c) => ({ id: c.id, author: c.author?.username ?? 'Unknown', body: c.body, createdAt: c.createdAt }));
}

export async function postComment(taskId: string, body: string): Promise<UiComment> {
  const c = await apiFetch<ApiComment>(`/tasks/${taskId}/comments`, { method: 'POST', body: JSON.stringify({ body }) });
  return { id: c.id, author: c.author?.username ?? 'Unknown', body: c.body, createdAt: c.createdAt };
}