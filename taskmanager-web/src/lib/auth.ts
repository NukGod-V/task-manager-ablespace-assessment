import { ACTIVE_PROJECT_STORAGE_KEY } from './storage-keys';

export interface AuthUser {
  id: string;
  username: string;
  authProvider: string;
  email?: string;
  fullName?: string | null; // NEW
  title?: string | null;    // NEW
}

const TOKEN_KEY = 'accessToken';
const USER_KEY = 'authUser';

export function setSession(accessToken: string, user: AuthUser) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(TOKEN_KEY, accessToken);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  // THE FIX: guest login always creates a brand-new user. Re-using a
  // previous session's active project (which this new user isn't a
  // member of) is exactly what caused the 403s.
  window.localStorage.removeItem(ACTIVE_PROJECT_STORAGE_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as AuthUser) : null;
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
  window.localStorage.removeItem(ACTIVE_PROJECT_STORAGE_KEY);
}