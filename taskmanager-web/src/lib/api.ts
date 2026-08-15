import { getAccessToken } from './auth';
import type { MockTask, TaskStatus, TaskPriority } from '@/types/task';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

// --- Raw shapes returned by the NestJS API ---
interface ApiUser {
  id: string;
  username: string;
  authProvider: string;
}

interface ApiProject {
  id: string;
  name: string;
  workspaceId: string | null;
  lead: ApiUser | null;
  members: ApiUser[];
}

interface ApiTask {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  position: number;
  dueDate: string | null;
  owner: ApiUser;
  assignee: ApiUser | null;
  project: ApiProject | null;
}

interface GuestLoginResponse {
  accessToken: string;
  user: { id: string; username: string; authProvider: string };
}

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
    throw new Error(`API ${options.method ?? 'GET'} ${path} failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// --- Auth ---

export async function guestLogin(): Promise<GuestLoginResponse> {
  const res = await fetch(`${API_URL}/auth/guest`, { method: 'POST' });
  if (!res.ok) throw new Error(`Guest login failed: ${res.status}`);
  return res.json();
}

// --- Task shape adapter ---
// No `role` field on User and no Label table yet on the backend, so those
// parts of the UI's task shape get honest placeholders, not fake data.
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
      ? {
          name: task.assignee.username,
          role: 'Member', // no role field on User yet
          initials: task.assignee.username[0]?.toUpperCase() ?? '?',
        }
      : null,
    labels: [],
    reporter: task.owner
      ? { name: task.owner.username, initials: task.owner.username[0]?.toUpperCase() ?? '?' }
      : null,
  };
}

// --- Tasks ---
// projectId is a SEPARATE parameter, not part of the input object below —
// this is the split that caused your confusion. The page that calls
// createTask() already knows the active project; the Add Task form itself
// never needs to think about projectId at all.

export interface CreateTaskInput {
  title: string;
  status?: TaskStatus;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string;
  assigneeId?: string;
}

export async function fetchTasks(projectId: string): Promise<MockTask[]> {
  const tasks = await apiFetch<ApiTask[]>(`/tasks?projectId=${projectId}`);
  return tasks.map(mapApiTaskToUi);
}

export async function createTask(projectId: string, input: CreateTaskInput): Promise<MockTask> {
  const task = await apiFetch<ApiTask>('/tasks', {
    method: 'POST',
    body: JSON.stringify({ ...input, projectId }),
  });
  return mapApiTaskToUi(task);
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
  projectId?: string | null;
  assigneeId?: string | null;
}

export async function updateTask(id: string, input: UpdateTaskInput): Promise<MockTask> {
  const task = await apiFetch<ApiTask>(`/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
  return mapApiTaskToUi(task);
}

export async function reorderTask(
  id: string,
  input: { status: TaskStatus; position: number },
): Promise<MockTask> {
  const task = await apiFetch<ApiTask>(`/tasks/${id}/reorder`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
  return mapApiTaskToUi(task);
}

// --- Projects ---

export interface UiProject {
  id: string;
  name: string;
  lead: { id: string; username: string } | null;
  members: { id: string; username: string }[];
}

export async function fetchProjects(): Promise<UiProject[]> {
  const projects = await apiFetch<ApiProject[]>('/projects');
  return projects.map((p) => ({
    id: p.id,
    name: p.name,
    lead: p.lead ? { id: p.lead.id, username: p.lead.username } : null,
    members: p.members?.map((m) => ({ id: m.id, username: m.username })) ?? [],
  }));
}

export async function createProject(name: string, memberIds: string[] = []): Promise<UiProject> {
  const project = await apiFetch<ApiProject>('/projects', {
    method: 'POST',
    body: JSON.stringify({ name, memberIds }),
  });
  return {
    id: project.id,
    name: project.name,
    lead: project.lead ? { id: project.lead.id, username: project.lead.username } : null,
    members: project.members?.map((m) => ({ id: m.id, username: m.username })) ?? [],
  };
}

// --- Users ---

export interface UiAppUser {
  id: string;
  username: string;
}

export async function fetchUsers(): Promise<UiAppUser[]> {
  const users = await apiFetch<ApiUser[]>('/users');
  return users.map((u) => ({ id: u.id, username: u.username }));
}