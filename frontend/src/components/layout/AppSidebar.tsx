import { useState } from 'react';
import { NavLink } from 'react-router';
import {
  FolderOpen,
  FolderClosed,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useProjects } from '../../hooks/useProjects';
import { Button } from '../ui/button';
import type { Project } from '../../api/types';

export function AppSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { data: projects, isLoading } = useProjects();

  return (
    <aside
      className={`flex flex-col h-full bg-card border-r border-border transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex items-center justify-between p-3 border-b border-border">
        {isCollapsed ? null : <p>Projects</p>}

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-8 h-8"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </div>

      <nav className="flex-1 p-2 overflow-y-auto">
        {isLoading ? (
          <div
            className={`text-sm text-muted-foreground ${isCollapsed ? 'text-center' : 'px-3 py-2'}`}
          >
            {isCollapsed ? '...' : 'Loading...'}
          </div>
        ) : projects && projects.length > 0 ? (
          <ul className="space-y-1">
            {projects.map((project: Project) => (
              <li key={project.id}>
                <NavLink
                  to={`/projects/${project.id}`}
                  className={({ isActive }) =>
                    `flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md transition-colors ${
                      isActive
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'
                    } ${isCollapsed ? 'justify-center px-0' : ''}`
                  }
                  title={isCollapsed ? project.name : undefined}
                >
                  {({ isActive }) => (
                    <>
                      {isActive ? (
                        <FolderOpen className="w-4 h-4 shrink-0" />
                      ) : (
                        <FolderClosed className="w-4 h-4 shrink-0" />
                      )}
                      {!isCollapsed && (
                        <span className="truncate">{project.name}</span>
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        ) : (
          <div
            className={`text-sm text-muted-foreground ${isCollapsed ? 'text-center' : 'px-3 py-2'}`}
          >
            {isCollapsed ? '—' : 'No projects'}
          </div>
        )}
      </nav>
    </aside>
  );
}
