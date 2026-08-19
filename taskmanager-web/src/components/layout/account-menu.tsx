'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { ChevronRight, Check, Sun, Moon, Settings as SettingsIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useClickOutside } from '@/hooks/use-click-outside';
import { useColorMode, type ColorMode } from '@/components/providers/theme-provider';
import { Avatar } from '@/components/ui/avatar';
import type { AuthUser } from '@/lib/auth';

const COLOR_MODES: { value: ColorMode; label: string; hex: string }[] = [
  { value: 'amber', label: 'Amber', hex: '#F59E0B' },
  { value: 'blue', label: 'Blue', hex: '#7C3AED' },
  { value: 'pink', label: 'Pink', hex: '#EC4899' },
  { value: 'rose', label: 'Rose', hex: '#F43F5E' },
  { value: 'emerald', label: 'Emerald', hex: '#10B981' },
  { value: 'black', label: 'Black', hex: '#111827' },
];

interface AccountMenuProps { user: AuthUser | null; onClose: () => void; }
type Submenu = 'theme' | 'colorMode' | null;

export function AccountMenu({ user, onClose }: AccountMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [activeSubmenu, setActiveSubmenu] = useState<Submenu>(null);
  const { theme, setTheme } = useTheme();
  const { colorMode, setColorMode } = useColorMode();
  useClickOutside(menuRef, onClose);

  return (
    <div ref={menuRef} className="absolute left-0 top-full z-50 mt-1 w-64 rounded-xl border border-border bg-card p-1.5 shadow-lg">
      <div className="flex items-center gap-2.5 px-2.5 py-2">
        {/* THE FIX — was a plain initials div, ignored avatarUrl entirely */}
        <Avatar name={user?.username} avatarUrl={user?.avatarUrl} initials={user?.username?.[0]?.toUpperCase() ?? '?'} size={32} />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{user?.username ?? 'Loading…'}</p>
          <p className="truncate text-xs text-muted">{user?.email ?? 'Guest session'}</p>
        </div>
      </div>

      <div className="my-1 h-px bg-border" />

      <MenuRow label="Change Theme" icon={theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />} active={activeSubmenu === 'theme'} onOpen={() => setActiveSubmenu('theme')} onClose={() => setActiveSubmenu(null)}>
        <SubmenuItem label="Light" active={theme === 'light'} onClick={() => setTheme('light')} leading={<Sun size={14} />} />
        <SubmenuItem label="Dark" active={theme === 'dark'} onClick={() => setTheme('dark')} leading={<Moon size={14} />} />
      </MenuRow>

      <MenuRow label="Color Mode" icon={<span className="h-3.5 w-3.5 rounded-full border border-border" style={{ backgroundColor: COLOR_MODES.find((m) => m.value === colorMode)?.hex }} />} active={activeSubmenu === 'colorMode'} onOpen={() => setActiveSubmenu('colorMode')} onClose={() => setActiveSubmenu(null)}>
        {COLOR_MODES.map((mode) => (
          <SubmenuItem key={mode.value} label={mode.label} active={colorMode === mode.value} onClick={() => setColorMode(mode.value)} leading={<span className="h-3.5 w-3.5 rounded-full border border-border" style={{ backgroundColor: mode.hex }} />} />
        ))}
      </MenuRow>

      <div className="my-1 h-px bg-border" />

      <Link href="/settings" onClick={onClose} className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-foreground hover:bg-sidebar-active">
        <SettingsIcon size={14} className="text-muted" /> Settings
      </Link>
    </div>
  );
}

function MenuRow({ label, icon, active, onOpen, onClose, children }: { label: string; icon: React.ReactNode; active: boolean; onOpen: () => void; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="relative" onMouseEnter={onOpen} onMouseLeave={onClose}>
      <button onClick={() => (active ? onClose() : onOpen())} className={cn('flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-foreground', active ? 'bg-sidebar-active' : 'hover:bg-sidebar-active')}>
        <span className="text-muted">{icon}</span>
        <span className="flex-1 text-left">{label}</span>
        <ChevronRight size={14} className="text-muted" />
      </button>
      {active && <div className="absolute left-full top-0 z-50 ml-1 w-48 rounded-xl border border-border bg-card p-1.5 shadow-lg">{children}</div>}
    </div>
  );
}

function SubmenuItem({ label, active, onClick, leading }: { label: string; active: boolean; onClick: () => void; leading: React.ReactNode }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-foreground hover:bg-sidebar-active">
      {leading}
      <span className="flex-1 text-left">{label}</span>
      {active && <Check size={14} className="text-accent" />}
    </button>
  );
}