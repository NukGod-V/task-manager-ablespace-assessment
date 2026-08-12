'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, ChevronRight, CheckSquare, FolderKanban } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebar } from './sidebar-context';
import { getStoredUser, type AuthUser } from '@/lib/auth';
import { useEffect, useRef, useState } from 'react';
import { AccountMenu } from './account-menu';

const NAV_ITEMS = [
  { label: 'Tasks', href: '/tasks', icon: CheckSquare },
  { label: 'Projects', href: '/projects', icon: FolderKanban },
];

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed } = useSidebar();
  const [workspaceOpen, setWorkspaceOpen] = useState(true);

  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  useEffect(() => {
    setMounted(true);
    setUser(getStoredUser());
  }, []);

  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const switcherWrapperRef = useRef<HTMLDivElement>(null);

  return (
    <aside
      className={cn(
        'flex h-screen flex-col border-r border-border bg-sidebar transition-all duration-200',
        collapsed ? 'w-0 overflow-hidden border-r-0' : 'w-[248px]',
      )}
    >
      {/* Workspace switcher — now opens the real Account Menu */}
      <div ref={switcherWrapperRef} className="relative border-b border-border">
        <button
          onClick={() => setAccountMenuOpen((o) => !o)}
          className="flex w-full items-center gap-2 px-4 py-4 text-left hover:bg-sidebar-active"
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-medium text-white">
            {mounted && user?.username ? user.username[0].toUpperCase() : '?'}
          </div>
          <span className="flex-1 truncate text-sm font-medium text-foreground">
            {mounted && user?.username ? user.username : 'Loading…'}
          </span>
          <ChevronDown size={16} className="text-muted shrink-0" />
        </button>

        {accountMenuOpen && (
          <div className="px-2">
            <AccountMenu user={user} onClose={() => setAccountMenuOpen(false)} />
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
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