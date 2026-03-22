import { Trash2 } from 'lucide-react';
import type { Project } from '../api/types';

interface ProjectCardProps {
  project: Project;
  onRemove: (id: string) => void;
}

export function ProjectCard({ project, onRemove }: ProjectCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900 dark:text-white truncate text-base">
              {project.name}
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {new Date(project.created_at).toLocaleDateString()}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-mono truncate mt-1">
            {project.path}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded">
              {project.compose_file}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={() => onRemove(project.id)}
              className="px-3 py-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded font-medium text-sm transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
