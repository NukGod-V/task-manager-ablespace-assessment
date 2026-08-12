'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, ChevronRight, CheckSquare, FolderKanban } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebar } from './sidebar-context';
import { getStoredUser } from '@/lib/auth';
import { useEffect, useState } from 'react';

const NAV_ITEMS = [
  { label: 'Tasks', href: '/tasks', icon: CheckSquare },
  { label: 'Projects', href: '/projects', icon: FolderKanban },
];

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed } = useSidebar();
  const [workspaceOpen, setWorkspaceOpen] = useState(true);

  // Gate on mount to avoid hydration mismatch — localStorage isn't
  // available during SSR, same pattern as the theme providers.
  const [mounted, setMounted] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  useEffect(() => {
    setMounted(true);
    setUsername(getStoredUser()?.username ?? null);
  }, []);

  return (
    <aside
      className={cn(
        'flex h-screen flex-col border-r border-border bg-sidebar transition-all duration-200',
        collapsed ? 'w-0 overflow-hidden border-r-0' : 'w-[248px]',
      )}
    >
      {/* Workspace switcher — opens the Account dropdown once that's built */}
      <button
        className="flex items-center gap-2 border-b border-border px-4 py-4 text-left hover:bg-sidebar-active"
        // TODO: wire to Account Menu dropdown (figma-extraction §2.9) once built
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-medium text-white">
          {mounted && username ? username[0].toUpperCase() : '?'}
        </div>
        <span className="flex-1 truncate text-sm font-medium text-foreground">
          {mounted && username ? username : 'Loading…'}
        </span>
        <ChevronDown size={16} className="text-muted shrink-0" />
      </button>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {/* Collapsible "Workspace" group label. Flagged as ambiguous against
            the raw screenshots (side-chat review) — confirmed functional
            behavior here, easy to make static if Figma shows otherwise. */}
        <button
          onClick={() => setWorkspaceOpen((o) => !o)}
          className="flex w-full items-center gap-1 px-2 py-1.5 text-xs font-medium uppercase tracking-wide text-muted"
        >
          {workspaceOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          Workspace
        </button>

        {workspaceOpen && (
          <ul className="mt-1 flex flex-col gap-0.5">
            {NAV_ITEMS.map((item) => {
              const active = pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-foreground',
                      active ? 'bg-sidebar-active' : 'hover:bg-sidebar-active/60',
                    )}
                  >
                    <Icon size={16} className="text-muted" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </nav>
    </aside>
  );
}