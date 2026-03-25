import { useState } from "react";
import { ArrowLeft, FolderOpen, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import {
  useProject,
  useContainers,
  useDeleteProject,
  useStartContainer,
  useStopContainer,
  useRestartContainer,
} from "../hooks/useContainers";
import { ContainerTable } from "../components/containers/ContainerTable";
import { Button } from "../components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";

interface ProjectDetailPageProps {
  projectId: string;
  onBack: () => void;
}

export function ProjectDetailPage({
  projectId,
  onBack,
}: ProjectDetailPageProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    data: project,
    isLoading: projectLoading,
    error: projectError,
  } = useProject(projectId);
  const { data: containers, isLoading: containersLoading } =
    useContainers(projectId);
  const deleteProject = useDeleteProject();
  const startContainer = useStartContainer(projectId);
  const stopContainer = useStopContainer(projectId);
  const restartContainer = useRestartContainer(projectId);

  const handleDeleteProject = async () => {
    try {
      await deleteProject.mutateAsync(projectId);
      toast.success("Project removed successfully");
      setShowDeleteConfirm(false);
      onBack();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to remove project";
      toast.error(message);
    }
  };

  const handleStartContainer = async (containerId: string) => {
    try {
      await startContainer.mutateAsync(containerId);
      toast.success("Container started successfully");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to start container";
      toast.error(message);
    }
  };

  const handleStopContainer = async (containerId: string) => {
    try {
      await stopContainer.mutateAsync(containerId);
      toast.success("Container stopped successfully");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to stop container";
      toast.error(message);
    }
  };

  const handleRestartContainer = async (containerId: string) => {
    try {
      await restartContainer.mutateAsync(containerId);
      toast.success("Container restarted successfully");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to restart container";
      toast.error(message);
    }
  };

  const isActionPending =
    startContainer.isPending ||
    stopContainer.isPending ||
    restartContainer.isPending;

  if (projectLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading project...</div>
      </div>
    );
  }

  if (projectError || !project) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-destructive">
          {projectError?.message || "Failed to load project"}
        </div>
      </div>
    );
  }

  const runningCount =
    containers?.filter((c) => c.state === "running").length ?? 0;
  const totalCount = containers?.length ?? 0;

  return (
    <div className="px-4 py-8 mx-auto max-w-7xl md:px-6 lg:px-8">
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={onBack} className="mb-4">
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
              {project.compose_file} • {totalCount} container
              {totalCount !== 1 ? "s" : ""}
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
            The compose file was moved or deleted. Containers will still be
            displayed if they exist.
          </p>
        </div>
      )}

      <div className="bg-card border border-border rounded-lg">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg font-medium text-foreground">Containers</h2>
          <p className="text-sm text-muted-foreground">
            {containersLoading
              ? "Loading containers..."
              : `${totalCount} container${totalCount !== 1 ? "s" : ""}`}
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

      <AlertDialog
        open={showDeleteConfirm}
        onOpenChange={(open) => !open && setShowDeleteConfirm(false)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove &quot;{project.name}&quot;? This
              will only remove it from the list. Containers will not be stopped
              or deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProject}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
