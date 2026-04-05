import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProject,
  getContainers,
  deleteProject,
  startContainer,
  stopContainer,
  restartContainer,
} from "../api/client";
import type { Project, Container } from "../api/types";

// Query keys
const projectsKey = "projects";
const containersKey = "containers";

export function useProject(projectId: string) {
  return useQuery<Project, Error>({
    queryKey: [projectsKey, projectId],
    queryFn: () => getProject(projectId),
    refetchInterval: 5000, // Poll every 5 seconds
    refetchIntervalInBackground: false, // Pause polling when window is not visible
  });
}

export function useContainers(projectId: string) {
  return useQuery<Container[], Error>({
    queryKey: [containersKey, projectId],
    queryFn: () => getContainers(projectId),
    refetchInterval: 2000, // Poll every 2 seconds
    refetchIntervalInBackground: false, // Pause polling when window is not visible
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

export function useStartContainer(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: startContainer,
    onSuccess: () => {
      // Invalidate containers query to refresh the list
      queryClient.invalidateQueries({ queryKey: [containersKey, projectId] });
    },
  });
}

export function useStopContainer(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: stopContainer,
    onSuccess: () => {
      // Invalidate containers query to refresh the list
      queryClient.invalidateQueries({ queryKey: [containersKey, projectId] });
    },
  });
}

export function useRestartContainer(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: restartContainer,
    onSuccess: () => {
      // Invalidate containers query to refresh the list
      queryClient.invalidateQueries({ queryKey: [containersKey, projectId] });
    },
  });
}
