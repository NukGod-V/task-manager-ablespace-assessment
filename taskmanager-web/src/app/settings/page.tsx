'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { ArrowLeft, Search, User as UserIcon, Sun, Palette, Pencil, Check, Sun as SunIcon, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useColorMode, type ColorMode } from '@/components/providers/theme-provider';
import { getAccessToken, getStoredUser, setSession, type AuthUser } from '@/lib/auth';
import { fetchCurrentUser, updateProfile } from '@/lib/api';

type SettingsSection = 'profile' | 'theme' | 'color';

const NAV_ITEMS: { key: SettingsSection; label: string; icon: typeof UserIcon }[] = [
  { key: 'profile', label: 'Profile', icon: UserIcon },
  { key: 'theme', label: 'Theme', icon: Sun },
  { key: 'color', label: 'Color', icon: Palette },
];

const COLOR_MODES: { value: ColorMode; label: string; hex: string }[] = [
  { value: 'amber', label: 'Amber', hex: '#F59E0B' },
  { value: 'blue', label: 'Blue', hex: '#7C3AED' },
  { value: 'pink', label: 'Pink', hex: '#EC4899' },
  { value: 'rose', label: 'Rose', hex: '#F43F5E' },
  { value: 'emerald', label: 'Emerald', hex: '#10B981' },
  { value: 'black', label: 'Black', hex: '#111827' },
];

export default function SettingsPage() {
  const router = useRouter();
  const [section, setSection] = useState<SettingsSection>('profile');
  const [search, setSearch] = useState('');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getAccessToken()) {
      router.push('/login');
      return;
    }
    fetchCurrentUser()
      .then((u) => setUser({ id: u.id, username: u.username, authProvider: u.authProvider, fullName: u.fullName, title: u.title }))
      .catch(() => setUser(getStoredUser())) // fall back to whatever's cached locally if the fetch fails
      .finally(() => setLoading(false));
  }, [router]);

  const filteredNav = useMemo(
    () => NAV_ITEMS.filter((item) => item.label.toLowerCase().includes(search.toLowerCase())),
    [search],
  );

  if (loading || !user) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-muted">Loading settings…</div>;
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left settings nav — deliberately NOT the main app Sidebar; this
          replaces the whole app shell per the reference, matching
          figma-extraction §2.10 exactly. */}
      <aside className="flex w-[248px] shrink-0 flex-col border-r border-border bg-sidebar p-3">
        <button onClick={() => router.push('/tasks')} className="mb-3 flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm text-secondary hover:bg-sidebar-active hover:text-foreground">
          <ArrowLeft size={14} /> Back to app
        </button>

        <div className="mb-2 flex items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-1.5">
          <Search size={13} className="text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted"
          />
        </div>

        <nav className="flex flex-col gap-0.5">
          {filteredNav.map((item) => {
            const Icon = item.icon;
            const active = section === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setSection(item.key)}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm font-medium',
                  active ? 'bg-sidebar-active text-foreground' : 'text-secondary hover:bg-sidebar-active/60',
                )}
              >
                {item.key === 'color' ? (
                  <span className="h-3.5 w-3.5 rounded-sm bg-foreground" />
                ) : (
                  <Icon size={15} />
                )}
                {item.label}
              </button>
            );
          })}
          {filteredNav.length === 0 && <p className="px-2.5 py-2 text-xs text-muted">No matching settings</p>}
        </nav>
      </aside>

      <main className="flex-1 p-10">
        <div className="mx-auto max-w-[640px]">
          {section === 'profile' && <ProfileSection user={user} onUserChange={setUser} />}
          {section === 'theme' && <ThemeSection />}
          {section === 'color' && <ColorSection />}
        </div>
      </main>
    </div>
  );
}

// ---------------------------------------------------------------------

function ProfileSection({ user, onUserChange }: { user: AuthUser; onUserChange: (u: AuthUser) => void }) {
  const [fullName, setFullName] = useState(user.fullName ?? '');
  const [title, setTitle] = useState(user.title ?? '');
  const [username, setUsername] = useState(user.username);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function persist(patch: { fullName?: string; title?: string; username?: string }) {
    setSaving(true);
    setError(null);
    try {
      const saved = await updateProfile(patch);
      const nextUser: AuthUser = { ...user, username: saved.username, fullName: saved.fullName, title: saved.title };
      onUserChange(nextUser);
      // Keep the cached session in sync — Sidebar/workspace switcher reads
      // getStoredUser() directly, so this is what makes a username change
      // show up immediately elsewhere in the app without a hard refresh.
      setSession(localStorage.getItem('accessToken') ?? '', nextUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save that change.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-foreground">Profile</h1>

      <div className="rounded-xl border border-border bg-card">
        <Row label="Profile picture">
          <div title="Profile picture upload coming soon" className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-medium text-white">
            {user.username[0]?.toUpperCase() ?? '?'}
          </div>
        </Row>

        <Row label="Email">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted">{user.email ?? 'No email (guest account)'}</span>
            <button disabled title="Connect Google to add an email" className="text-muted opacity-40">
              <Pencil size={13} />
            </button>
          </div>
        </Row>

        <Row label="Full name">
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            onBlur={() => fullName !== (user.fullName ?? '') && persist({ fullName })}
            placeholder="Your full name"
            className="w-56 rounded-lg bg-sidebar px-3 py-2 text-right text-sm text-foreground outline-none placeholder:text-muted"
          />
        </Row>

        <Row label="Title" hint="Your job title or role">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => title !== (user.title ?? '') && persist({ title })}
            placeholder="Designer"
            className="w-56 rounded-lg bg-sidebar px-3 py-2 text-right text-sm text-foreground outline-none placeholder:text-muted"
          />
        </Row>

        <Row label="Username" hint="One word, like a nickname or first name" last>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onBlur={() => username.trim() && username !== user.username && persist({ username: username.trim() })}
            className="w-56 rounded-lg bg-sidebar px-3 py-2 text-right text-sm text-foreground outline-none"
          />
        </Row>
      </div>

      {saving && <p className="mt-2 text-xs text-muted">Saving…</p>}
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}

      <h2 className="mb-2 mt-8 text-base font-semibold text-foreground">Workspace access</h2>
      <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-4">
        <p className="text-sm text-muted">Remove yourself from the workspace</p>
        <button
          disabled
          title="No workspace membership to leave — this account isn't part of a multi-user workspace yet"
          className="cursor-not-allowed rounded-full bg-date-overdue-bg px-4 py-1.5 text-sm font-medium text-date-overdue opacity-60"
        >
          Leave Workspace
        </button>
      </div>
    </div>
  );
}

function Row({ label, hint, children, last }: { label: string; hint?: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div className={cn('flex items-center justify-between px-5 py-4', !last && 'border-b border-border')}>
      <div>
        <p className="text-sm text-foreground">{label}</p>
        {hint && <p className="text-xs text-muted">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------

function ThemeSection() {
  const { theme, setTheme } = useTheme();
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-foreground">Theme</h1>
      <div className="rounded-xl border border-border bg-card p-2">
        {[
          { value: 'light', label: 'Light', icon: SunIcon },
          { value: 'dark', label: 'Dark', icon: Moon },
        ].map((opt) => {
          const Icon = opt.icon;
          const active = theme === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => setTheme(opt.value)}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-sidebar-active"
            >
              <span className="flex items-center gap-2"><Icon size={15} /> {opt.label}</span>
              {active && <Check size={15} className="text-accent" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ColorSection() {
  const { colorMode, setColorMode } = useColorMode();
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-foreground">Color</h1>
      <div className="rounded-xl border border-border bg-card p-2">
        {COLOR_MODES.map((mode) => {
          const active = colorMode === mode.value;
          return (
            <button
              key={mode.value}
              onClick={() => setColorMode(mode.value)}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-sidebar-active"
            >
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-full border border-border" style={{ backgroundColor: mode.hex }} />
                {mode.label}
              </span>
              {active && <Check size={15} className="text-accent" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}