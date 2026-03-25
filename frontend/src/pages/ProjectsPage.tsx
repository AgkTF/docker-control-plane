import { useState } from 'react';
import { Plus, FolderOpen } from 'lucide-react';
import { toast } from 'sonner';
import {
  useProjects,
  useCreateProject,
  useDeleteProject,
} from '../hooks/useProjects';
import { ProjectCard } from '../components/ProjectCard';
import { AddProjectModal } from '../components/AddProjectModal';
import { Button } from '../components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';

interface ProjectsPageProps {
  onProjectSelect?: (projectId: string) => void;
}

export function ProjectsPage({ onProjectSelect }: ProjectsPageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectToRemove, setProjectToRemove] = useState<string | null>(null);

  const { data: projects, isLoading, error } = useProjects();
  const createProject = useCreateProject();
  const deleteProject = useDeleteProject();

  const handleAddProject = async (path: string) => {
    try {
      await createProject.mutateAsync({ path });
      toast.success('Project added successfully');
      setIsModalOpen(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to add project';
      toast.error(message);
    }
  };

  const handleRemoveProject = async (id: string) => {
    setProjectToRemove(id);
  };

  const confirmRemoveProject = async () => {
    if (!projectToRemove) return;

    try {
      await deleteProject.mutateAsync(projectToRemove);
      toast.success('Project removed successfully');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to remove project';
      toast.error(message);
    } finally {
      setProjectToRemove(null);
    }
  };

  const handleViewProject = (id: string) => {
    if (onProjectSelect) {
      onProjectSelect(id);
    }
  };

  return (
    <div className="px-4 py-8 mx-auto max-w-7xl md:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-foreground">
          Projects
        </h2>
        <Button
          variant="default"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Add Project
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">
            Loading projects...
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-destructive">
            Error loading projects: {error.message}
          </div>
        </div>
      ) : projects && projects.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onRemove={handleRemoveProject}
              onViewContainers={handleViewProject}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <FolderOpen className="w-16 h-16 mb-4 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-medium text-foreground">
            No projects yet
          </h3>
          <p className="mb-4 text-muted-foreground">
            Add your first Docker Compose project to get started
          </p>
          <Button
            variant="default"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Add Project
          </Button>
        </div>
      )}

      <AddProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddProject}
        isSubmitting={createProject.isPending}
      />

      <AlertDialog
        open={!!projectToRemove}
        onOpenChange={(open) => !open && setProjectToRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this project? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProjectToRemove(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemoveProject}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
