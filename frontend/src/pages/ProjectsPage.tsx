import { useState } from 'react';
import { Plus, FolderOpen } from 'lucide-react';
import {
  useProjects,
  useCreateProject,
  useDeleteProject,
} from '../hooks/useProjects';
import { ProjectCard } from '../components/ProjectCard';
import { AddProjectModal } from '../components/AddProjectModal';
import { ToastContainer, type Toast } from '../components/Toast';

export function ProjectsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const { data: projects, isLoading, error } = useProjects();
  const createProject = useCreateProject();
  const deleteProject = useDeleteProject();

  const addToast = (type: Toast['type'], message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleAddProject = async (path: string) => {
    try {
      await createProject.mutateAsync({ path });
      addToast('success', 'Project added successfully');
      setIsModalOpen(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to add project';
      addToast('error', message);
    }
  };

  const handleRemoveProject = async (id: string) => {
    if (!confirm('Are you sure you want to remove this project?')) return;

    try {
      await deleteProject.mutateAsync(id);
      addToast('success', 'Project removed successfully');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to remove project';
      addToast('error', message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Header */}
      <header className="flex items-center justify-between px-6 bg-white border-b border-gray-200 h-14 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🐳</span>
          <p className="text-xl font-semibold text-gray-900 dark:text-white">
            Docker Control Plane
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          <span className="text-gray-600 dark:text-gray-400">Connected</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-8 mx-auto max-w-7xl md:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Projects
          </h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Project
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500 dark:text-gray-400">
              Loading projects...
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-red-500">
              Error loading projects: {error.message}
            </div>
          </div>
        ) : projects && projects.length > 0 ? (
          <div className="grid gap-4">
            {projects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                onRemove={handleRemoveProject}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <FolderOpen className="w-16 h-16 mb-4 text-gray-300 dark:text-slate-700" />
            <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
              No projects yet
            </h3>
            <p className="mb-4 text-gray-500 dark:text-gray-400">
              Add your first Docker Compose project to get started
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add Project
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="flex items-center justify-between h-12 px-6 text-sm text-gray-500 bg-white border-t border-gray-200 dark:border-slate-700 dark:bg-slate-900 dark:text-gray-400">
        <span>v1.0.0</span>
        <span>Ready</span>
      </footer>

      {/* Modal */}
      <AddProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddProject}
        isSubmitting={createProject.isPending}
      />

      {/* Toasts */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
