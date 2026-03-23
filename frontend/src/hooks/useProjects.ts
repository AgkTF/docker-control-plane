import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listProjects, createProject, deleteProject, validatePath } from '../api/client';
import type { CreateProjectRequest } from '../api/types';

const projectsKey = 'projects';

export function useProjects() {
  return useQuery({
    queryKey: [projectsKey],
    queryFn: listProjects,
    refetchInterval: 5000, // Poll every 5 seconds
    refetchIntervalInBackground: false, // Pause polling when window is not visible
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (request: CreateProjectRequest) => createProject(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [projectsKey] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [projectsKey] });
    },
  });
}

export function useValidatePath() {
  return useMutation({
    mutationFn: (path: string) => validatePath(path),
  });
}
