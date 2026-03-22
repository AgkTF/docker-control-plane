import { useState } from 'react';
import { ArrowLeft, FolderOpen, Trash2, AlertTriangle } from 'lucide-react';
import { useProject, useContainers, useDeleteProject } from '../hooks/useContainers';
import { ContainerTable } from '../components/containers/ContainerTable';
import { ToastContainer, type Toast } from '../components/Toast';

interface ProjectDetailPageProps {
  projectId: string;
  onBack: () => void;
}

export function ProjectDetailPage({ projectId, onBack }: ProjectDetailPageProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: project, isLoading: projectLoading, error: projectError } = useProject(projectId);
  const { data: containers, isLoading: containersLoading } = useContainers(projectId);
  const deleteProject = useDeleteProject();

  const addToast = (type: Toast['type'], message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleDeleteProject = async () => {
    try {
      await deleteProject.mutateAsync(projectId);
      addToast('success', 'Project removed successfully');
      setShowDeleteConfirm(false);
      onBack();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to remove project';
      addToast('error', message);
    }
  };

  if (projectLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Loading project...</div>
      </div>
    );
  }

  if (projectError || !project) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-red-500">
          {projectError?.message || 'Failed to load project'}
        </div>
      </div>
    );
  }

  const runningCount = containers?.filter((c) => c.state === 'running').length ?? 0;
  const totalCount = containers?.length ?? 0;

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
        {/* Back Button & Title */}
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </button>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {project.name}
                </h1>
                {project.has_missing_compose && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                    <AlertTriangle className="w-3 h-3" />
                    Compose Missing
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <FolderOpen className="w-4 h-4" />
                <span className="font-mono text-sm">{project.path}</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {project.compose_file} • {totalCount} containers
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">Running</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {runningCount}/{totalCount}
                </p>
              </div>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
              >
                <Trash2 className="w-4 h-4" />
                Remove
              </button>
            </div>
          </div>
        </div>

        {/* Missing Compose Warning */}
        {project.has_missing_compose && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg dark:bg-yellow-900/20 dark:border-yellow-800">
            <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
              <AlertTriangle className="w-5 h-5" />
              <p className="font-medium">Compose file missing</p>
            </div>
            <p className="text-sm text-yellow-600 dark:text-yellow-500 mt-1">
              The compose file was moved or deleted. Containers will still be displayed if they exist.
            </p>
          </div>
        )}

        {/* Containers Section */}
        <div className="bg-white border border-gray-200 rounded-lg dark:border-slate-700 dark:bg-slate-900">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Containers
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {containersLoading
                ? 'Loading containers...'
                : `${totalCount} container${totalCount !== 1 ? 's' : ''}`}
            </p>
          </div>
          <div className="p-6">
            {containersLoading ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                Loading containers...
              </div>
            ) : (
              <ContainerTable containers={containers ?? []} />
            )}
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full dark:bg-slate-900 dark:border dark:border-slate-700">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Remove Project
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Are you sure you want to remove "{project.name}"?
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                This will only remove it from the list. Containers will not be stopped or deleted.
              </p>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors dark:text-gray-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteProject}
                  disabled={deleteProject.isPending}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {deleteProject.isPending ? 'Removing...' : 'Remove'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
