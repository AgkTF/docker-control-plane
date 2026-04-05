import type { ContainerStats } from "@/api/types";
import { useContainerStats } from "@/hooks/useContainerStats";

interface ContainerStatsCellProps {
  containerId: string;
}

interface StatsCellProps {
  containerId: string;
  renderValue: (stats: ContainerStats) => string | number;
}

function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

function StatsCell({ containerId, renderValue }: StatsCellProps) {
  const { data: stats, isLoading } = useContainerStats(containerId);

  if (isLoading || !stats) {
    return <span className="text-muted-foreground">-</span>;
  }

  return <span className="text-muted-foreground">{renderValue(stats)}</span>;
}

export function ContainerStatsCell({ containerId }: ContainerStatsCellProps) {
  return (
    <StatsCell
      containerId={containerId}
      renderValue={stats => formatPercentage(stats.cpu_percentage)}
    />
  );
}

export function ContainerMemoryCell({ containerId }: ContainerStatsCellProps) {
  return (
    <StatsCell
      containerId={containerId}
      renderValue={stats => formatPercentage(stats.memory_percentage)}
    />
  );
}

export function ContainerPIDsCell({ containerId }: ContainerStatsCellProps) {
  return (
    <StatsCell containerId={containerId} renderValue={stats => stats.pids} />
  );
}
