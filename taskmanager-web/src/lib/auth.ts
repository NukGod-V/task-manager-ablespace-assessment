export interface AuthUser {
  id: string;
  username: string;
  authProvider: string;
  email?: string; // only populated once Google OAuth exists; guests have none
}

const TOKEN_KEY = 'accessToken';
const USER_KEY = 'authUser';

export function setSession(accessToken: string, user: AuthUser) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(TOKEN_KEY, accessToken);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// This was the actual bug — missing the same guard every other function
// here already had, so it crashed the moment Next tried to server-render
// a component that called it directly in the render body.
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
}