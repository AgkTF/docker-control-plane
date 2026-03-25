import { useState } from 'react';
import { Plus, FolderOpen, Eye } from 'lucide-react';
import {
  useProjects,
  useCreateProject,
  useDeleteProject,
} from '../hooks/useProjects';
import { ProjectCard } from '../components/ProjectCard';
import { AddProjectModal } from '../components/AddProjectModal';
import { ToastContainer, type Toast } from '../components/Toast';
import { Button } from '../components/ui/button';

interface ProjectsPageProps {
  onProjectSelect?: (projectId: string) => void;
}

export function ProjectsPage({ onProjectSelect }: ProjectsPageProps) {
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
        <div className="grid gap-4">
          {projects.map(project => (
            <div key={project.id} className="bg-card border border-border rounded-lg p-4">
              <ProjectCard
                project={project}
                onRemove={handleRemoveProject}
              />
              <div className="mt-3 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewProject(project.id)}
                >
                  <Eye className="w-4 h-4" />
                  View Containers
                </Button>
              </div>
            </div>
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

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}