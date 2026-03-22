import { useState } from 'react';
import { Plus, FolderOpen } from 'lucide-react';
import { useProjects, useCreateProject, useDeleteProject } from '../hooks/useProjects';
import { ProjectCard } from './ProjectCard';
import { AddProjectModal } from './AddProjectModal';
import { ToastContainer, type Toast } from './Toast';

export function ProjectsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  const { data: projects, isLoading, error } = useProjects();
  const createProject = useCreateProject();
  const deleteProject = useDeleteProject();

  const addToast = (type: Toast['type'], message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleAddProject = async (path: string) => {
    try {
      await createProject.mutateAsync({ path });
      addToast('success', 'Project added successfully');
      setIsModalOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add project';
      addToast('error', message);
    }
  };

  const handleRemoveProject = async (id: string) => {
    if (!confirm('Are you sure you want to remove this project?')) return;
    
    try {
      await deleteProject.mutateAsync(id);
      addToast('success', 'Project removed successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to remove project';
      addToast('error', message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Header */}
      <header className="h-14 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🐳</span>
          <h1 className="text-gray-900 dark:text-white font-semibold">Docker Control Plane</h1>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          <span className="text-gray-600 dark:text-gray-400">Connected</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Projects</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Project
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500 dark:text-gray-400">Loading projects...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-red-500">Error loading projects: {error.message}</div>
          </div>
        ) : projects && projects.length > 0 ? (
          <div className="grid gap-4">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onRemove={handleRemoveProject}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <FolderOpen className="w-16 h-16 text-gray-300 dark:text-slate-700 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No projects yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Add your first Docker Compose project to get started
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Project
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="h-12 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-6 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
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
