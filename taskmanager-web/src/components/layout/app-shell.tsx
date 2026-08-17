'use client';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import { SidebarProvider } from './sidebar-context';
import { ViewModeProvider } from './view-mode-context';
import { TaskActionsProvider } from './task-actions-context';
import { FieldsProvider } from './fields-context';
import { FilterProvider } from './filter-context';
import { ActiveProjectProvider } from '@/components/providers/active-project-provider';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <ActiveProjectProvider>
        <ViewModeProvider>
          <FieldsProvider>
            <FilterProvider>
              <TaskActionsProvider>
                <div className="flex h-screen w-full overflow-hidden bg-background">
                  <Sidebar />
                  <div className="flex flex-1 flex-col overflow-hidden">
                    <Topbar />
                    <main className="flex-1 overflow-y-auto p-6">{children}</main>
                  </div>
                </div>
              </TaskActionsProvider>
            </FilterProvider>
          </FieldsProvider>
        </ViewModeProvider>
      </ActiveProjectProvider>
    </SidebarProvider>
  );
}