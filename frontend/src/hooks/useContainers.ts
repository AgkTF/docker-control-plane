import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProject, getContainers, deleteProject } from '../api/client';
import type { Project, Container } from '../api/types';

// Query keys
const projectsKey = 'projects';
const containersKey = 'containers';

export function useProject(projectId: string) {
  return useQuery<Project, Error>({
    queryKey: [projectsKey, projectId],
    queryFn: () => getProject(projectId),
    // refetchInterval: 2000, // Poll every 2 seconds
    refetchOnWindowFocus: false,
  });
}

export function useContainers(projectId: string) {
  return useQuery<Container[], Error>({
    queryKey: [containersKey, projectId],
    queryFn: () => getContainers(projectId),
    // refetchInterval: 2000, // Poll every 2 seconds
    refetchOnWindowFocus: false,
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: deleteProject,
    onSuccess: () => {
      // Invalidate the projects list query to refetch
      queryClient.invalidateQueries({ queryKey: [projectsKey] });
    },
  });
}
