import { useQuery } from "@tanstack/react-query";
import { getContainerStats } from "../api/client";
import type { ContainerStats } from "../api/types";

const containerStatsKey = "containerStats";

export function useContainerStats(containerId: string) {
  return useQuery<ContainerStats, Error>({
    queryKey: [containerStatsKey, containerId],
    queryFn: () => getContainerStats(containerId),
    refetchInterval: 5000, // Poll every 5 seconds
    refetchIntervalInBackground: false, // Pause polling when window is not visible
    enabled: !!containerId, // Only run if containerId is provided
  });
}
