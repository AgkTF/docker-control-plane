import type { ReactNode } from 'react';
import { AppHeader } from './AppHeader';
import { AppSidebar } from './AppSidebar';

interface AppLayoutProps {
  children: ReactNode;
  selectedProjectId?: string;
  onProjectSelect: (projectId: string) => void;
}

export function AppLayout({
  children,
  selectedProjectId,
  onProjectSelect,
}: AppLayoutProps) {
  return (
    <div className="flex flex-col h-screen bg-background">
      <AppHeader />
      <div className="flex flex-1 overflow-hidden">
        <AppSidebar
          selectedProjectId={selectedProjectId}
          onProjectSelect={onProjectSelect}
        />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
