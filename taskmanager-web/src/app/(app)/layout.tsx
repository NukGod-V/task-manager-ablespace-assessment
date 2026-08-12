import { AppShell } from '@/components/layout/app-shell';

// Route group (app) wraps every authenticated screen (/tasks, /projects, ...)
// in the shared Sidebar + Topbar shell without affecting the URL structure.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}