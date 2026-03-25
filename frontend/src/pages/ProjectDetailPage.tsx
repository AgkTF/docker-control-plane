import { useState } from 'react';
import { ArrowLeft, FolderOpen, Trash2, AlertTriangle } from 'lucide-react';
import { useProject, useContainers, useDeleteProject, useStartContainer, useStopContainer, useRestartContainer } from '../hooks/useContainers';
import { ContainerTable } from '../components/containers/ContainerTable';
import { ToastContainer, type Toast } from '../components/Toast';
import { Button } from '../components/ui/button';

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
  const startContainer = useStartContainer(projectId);
  const stopContainer = useStopContainer(projectId);
  const restartContainer = useRestartContainer(projectId);

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

  const handleStartContainer = async (containerId: string) => {
    try {
      await startContainer.mutateAsync(containerId);
      addToast('success', 'Container started successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start container';
      addToast('error', message);
    }
  };

  const handleStopContainer = async (containerId: string) => {
    try {
      await stopContainer.mutateAsync(containerId);
      addToast('success', 'Container stopped successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to stop container';
      addToast('error', message);
    }
  };

  const handleRestartContainer = async (containerId: string) => {
    try {
      await restartContainer.mutateAsync(containerId);
      addToast('success', 'Container restarted successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to restart container';
      addToast('error', message);
    }
  };

  const isActionPending = startContainer.isPending || stopContainer.isPending || restartContainer.isPending;

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
    <div className="px-4 py-8 mx-auto max-w-7xl md:px-6 lg:px-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-semibold text-foreground">
                {project.name}
              </h1>
              {project.has_missing_compose && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-warning/20 text-warning">
                  <AlertTriangle className="w-3 h-3" />
                  Compose Missing
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <FolderOpen className="w-4 h-4" />
              <span className="font-mono text-sm">{project.path}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {project.compose_file} • {totalCount} containers
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Running</p>
              <p className="text-xl font-semibold text-foreground">
                {runningCount}/{totalCount}
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="w-4 h-4" />
              Remove
            </Button>
          </div>
        </div>
      </div>

      {project.has_missing_compose && (
        <div className="mb-6 p-4 bg-warning/10 border border-warning/30 rounded-lg">
          <div className="flex items-center gap-2 text-warning">
            <AlertTriangle className="w-5 h-5" />
            <p className="font-medium">Compose file missing</p>
          </div>
          <p className="text-sm text-warning/80 mt-1">
            The compose file was moved or deleted. Containers will still be displayed if they exist.
          </p>
        </div>
      )}

      <div className="bg-card border border-border rounded-lg">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg font-medium text-foreground">
            Containers
          </h2>
          <p className="text-sm text-muted-foreground">
            {containersLoading
              ? 'Loading containers...'
              : `${totalCount} container${totalCount !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="p-6">
          {containersLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading containers...
            </div>
          ) : (
            <ContainerTable 
              containers={containers ?? []} 
              onStart={handleStartContainer}
              onStop={handleStopContainer}
              onRestart={handleRestartContainer}
              isActionPending={isActionPending}
            />
          )}
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-lg shadow-xl max-w-md w-full border border-border">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-2">
                Remove Project
              </h2>
              <p className="text-muted-foreground">
                Are you sure you want to remove "{project.name}"?
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                This will only remove it from the list. Containers will not be stopped or deleted.
              </p>
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteProject}
                  disabled={deleteProject.isPending}
                >
                  {deleteProject.isPending ? 'Removing...' : 'Remove'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
