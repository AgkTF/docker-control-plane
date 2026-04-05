import { Play, Square, RotateCw } from "lucide-react";
import type { Container } from "../../api/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  ContainerStatsCell,
  ContainerMemoryCell,
  ContainerPIDsCell,
} from "./ContainerStatsCell";

interface ContainerTableProps {
  containers: Container[];
  onStart: (id: string) => void;
  onStop: (id: string) => void;
  onRestart: (id: string) => void;
  isActionPending: boolean;
}

function StatusDot({ state }: { state: string }) {
  const getStatusColor = () => {
    switch (state) {
      case "running":
        return "bg-emerald-500";
      case "paused":
        return "bg-amber-500";
      case "exited":
      case "dead":
        return "bg-slate-500";
      default:
        return "bg-red-500";
    }
  };

  return <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />;
}

function getStateBadgeVariant(state: string): "success" | "warning" | "muted" {
  switch (state) {
    case "running":
      return "success";
    case "paused":
      return "warning";
    case "exited":
    case "dead":
      return "muted";
    default:
      return "muted";
  }
}

function formatPorts(ports: Container["ports"]): string {
  if (ports.length === 0) return "-";

  return ports.map((p) => `${p.host}:${p.container}`).join(", ");
}

export function ContainerTable({
  containers,
  onStart,
  onStop,
  onRestart,
  isActionPending,
}: ContainerTableProps) {
  if (containers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <div className="mb-4 text-4xl">🐳</div>
        <p className="text-lg font-medium">No containers running</p>
        <p className="text-sm">Start some containers to see them here</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-8">Status</TableHead>
          <TableHead>Service</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Image</TableHead>
          <TableHead>Ports</TableHead>
          <TableHead>CPU %</TableHead>
          <TableHead>Memory %</TableHead>
          <TableHead>PIDs</TableHead>
          <TableHead>State</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {containers.map((container) => (
          <TableRow key={container.id}>
            <TableCell>
              <StatusDot state={container.state} />
            </TableCell>
            <TableCell className="font-medium">{container.service}</TableCell>
            <TableCell>{container.name}</TableCell>
            <TableCell className="font-mono text-sm text-muted-foreground">
              {container.image}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {formatPorts(container.ports)}
            </TableCell>
            <TableCell className="text-sm">
              <ContainerStatsCell containerId={container.id} />
            </TableCell>
            <TableCell className="text-sm">
              <ContainerMemoryCell containerId={container.id} />
            </TableCell>
            <TableCell className="text-sm">
              <ContainerPIDsCell containerId={container.id} />
            </TableCell>
            <TableCell>
              <Badge variant={getStateBadgeVariant(container.state)}>
                {container.state}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                {container.state === "running" ? (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onStop(container.id)}
                      disabled={isActionPending}
                      className="hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      title="Stop container"
                    >
                      <Square className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRestart(container.id)}
                      disabled={isActionPending}
                      className="hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      title="Restart container"
                    >
                      <RotateCw className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onStart(container.id)}
                      disabled={isActionPending}
                      className="hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                      title="Start container"
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRestart(container.id)}
                      disabled={isActionPending}
                      className="hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      title="Restart container"
                    >
                      <RotateCw className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
