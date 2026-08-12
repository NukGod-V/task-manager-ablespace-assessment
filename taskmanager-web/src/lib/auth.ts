export interface AuthUser {
  id: string;
  username: string;
  authProvider: string;
  email?: string; // only populated once Google OAuth exists; guests have none
}

const TOKEN_KEY = 'accessToken';
const USER_KEY = 'authUser';

// Centralizes session storage so every place that needs the current user
// (Sidebar workspace switcher, future Account menu, route guards) reads
// from one place instead of touching localStorage directly.
export function setSession(accessToken: string, user: AuthUser) {
  window.localStorage.setItem(TOKEN_KEY, accessToken);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getStoredUser(): AuthUser | null {
  const raw = window.localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as AuthUser) : null;
}

export function clearSession() {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}