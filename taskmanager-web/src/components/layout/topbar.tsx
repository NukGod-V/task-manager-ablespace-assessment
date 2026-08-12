'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Search, SlidersHorizontal, Filter, Plus, PanelLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebar } from './sidebar-context';

// Simple pathname → breadcrumb/title mapping. Fine for the current two
// top-level routes; once Project detail pages exist (Projects > [Name]),
// this should be replaced with page-level props or route-segment-based
// breadcrumbs rather than string-matching pathnames.
function getPageMeta(pathname: string): { title: string; breadcrumb: string[] } {
  if (pathname.startsWith('/projects')) {
    return { title: 'Projects', breadcrumb: ['Projects'] };
  }
  return { title: 'Tasks', breadcrumb: ['Tasks'] };
}

export function Topbar() {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebar();
  const { title, breadcrumb } = getPageMeta(pathname);

  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // ⌘F / Ctrl+F opens search instead of the browser's native find,
  // matching the hotkey hint shown in the design.
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setSearchOpen(true);
        requestAnimationFrame(() => searchRef.current?.focus());
      }
      if (e.key === 'Escape') setSearchOpen(false);
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="flex h-14 items-center gap-3 border-b border-border bg-background px-4">
      <button
        onClick={toggle}
        className="rounded-lg p-1.5 hover:bg-sidebar-active"
        aria-label={collapsed ? 'Show sidebar' : 'Hide sidebar'}
      >
        <PanelLeft size={18} className="text-muted" />
      </button>

      {/* Breadcrumb + title, or the expanded search input in its place */}
      <div className="flex-1">
        {searchOpen ? (
          <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5">
            <Search size={16} className="text-muted" />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search..."
              onBlur={() => setSearchOpen(false)}
              className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted"
            />
            <kbd className="rounded border border-border px-1.5 py-0.5 text-[10px] text-muted">
              ⌘F
            </kbd>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-sm">
            {breadcrumb.map((crumb, i) => (
              <span key={crumb} className="flex items-center gap-1">
                {i > 0 && <span className="text-muted">/</span>}
                <span className={cn(i === breadcrumb.length - 1 ? 'font-semibold text-foreground' : 'text-muted')}>
                  {crumb}
                </span>
              </span>
            ))}
          </div>
        )}
      </div>

      {!searchOpen && (
        <button
          onClick={() => setSearchOpen(true)}
          className="rounded-lg p-1.5 hover:bg-sidebar-active"
          aria-label="Search"
        >
          <Search size={16} className="text-muted" />
        </button>
      )}

      {/* Fields dropdown (figma-extraction §2.5) — stubbed, not built this phase */}
      <button className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-foreground hover:bg-sidebar-active">
        <SlidersHorizontal size={14} />
        Fields
      </button>

      {/* Filter dropdown (Status/Priority/Members/...) — stubbed, not built this phase */}
      <button
        className="rounded-lg border border-border p-1.5 text-foreground hover:bg-sidebar-active"
        aria-label="Filter"
      >
        <Filter size={16} />
      </button>

      {/* Primary CTA — task/project creation modal not built yet this phase */}
      <button className="flex items-center gap-1 rounded-full bg-cta-primary px-4 py-1.5 text-sm font-medium text-cta-primary-foreground">
        <Plus size={14} />
        Add {title === 'Projects' ? 'Project' : 'Task'}
      </button>
    </header>
  );
}