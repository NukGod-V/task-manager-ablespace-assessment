const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

interface GuestLoginResponse {
  accessToken: string;
  user: { id: string; username: string; authProvider: string };
}

// Thin fetch wrapper — kept in one place so every future endpoint
// (Google OAuth, tasks, projects...) follows the same error-handling
// pattern instead of scattering raw fetch() calls through components.
export async function guestLogin(): Promise<GuestLoginResponse> {
  const res = await fetch(`${API_URL}/auth/guest`, { method: 'POST' });
  if (!res.ok) {
    throw new Error(`Guest login failed: ${res.status}`);
  }
  return res.json();
}