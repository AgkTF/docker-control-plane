import { Play, Square, RotateCw } from 'lucide-react';
import type { Container } from '../../api/types';

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
      case 'running':
        return 'bg-green-500';
      case 'paused':
        return 'bg-yellow-500';
      case 'exited':
      case 'dead':
        return 'bg-gray-400';
      default:
        return 'bg-red-500';
    }
  };

  return <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />;
}

function formatPorts(ports: Container['ports']): string {
  if (ports.length === 0) return '-';

  return ports.map(p => `${p.host}:${p.container}`).join(', ');
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
      <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
        <div className="mb-4 text-4xl">🐳</div>
        <p className="text-lg font-medium">No containers running</p>
        <p className="text-sm">Start some containers to see them here</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="w-8 px-4 py-3 text-sm font-medium text-left text-gray-500 dark:text-gray-400">
              Status
            </th>
            <th className="px-4 py-3 text-sm font-medium text-left text-gray-500 dark:text-gray-400">
              Service
            </th>
            <th className="px-4 py-3 text-sm font-medium text-left text-gray-500 dark:text-gray-400">
              Name
            </th>
            <th className="px-4 py-3 text-sm font-medium text-left text-gray-500 dark:text-gray-400">
              Image
            </th>
            <th className="px-4 py-3 text-sm font-medium text-left text-gray-500 dark:text-gray-400">
              Ports
            </th>
            <th className="px-4 py-3 text-sm font-medium text-left text-gray-500 dark:text-gray-400">
              State
            </th>
            <th className="px-4 py-3 text-sm font-medium text-left text-gray-500 dark:text-gray-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {containers.map(container => (
            <tr
              key={container.id}
              className="transition-colors border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-slate-800"
            >
              <td className="px-4 py-3">
                <StatusDot state={container.state} />
              </td>
              <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                {container.service}
              </td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                {container.name}
              </td>
              <td className="px-4 py-3 font-mono text-sm text-gray-500 dark:text-gray-400">
                {container.image}
              </td>
              <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                {formatPorts(container.ports)}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${
                    container.state === 'running'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : container.state === 'paused'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                  }`}
                >
                  {container.state}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                  {container.state === 'running' ? (
                    <>
                      <button
                        onClick={() => onStop(container.id)}
                        disabled={isActionPending}
                        className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/20"
                        title="Stop container"
                        aria-label="Stop container"
                      >
                        <Square className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onRestart(container.id)}
                        disabled={isActionPending}
                        className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/20"
                        title="Restart container"
                        aria-label="Restart container"
                      >
                        <RotateCw className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => onStart(container.id)}
                        disabled={isActionPending}
                        className="p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-400 dark:hover:text-green-400 dark:hover:bg-green-900/20"
                        title="Start container"
                        aria-label="Start container"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onRestart(container.id)}
                        disabled={isActionPending}
                        className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/20"
                        title="Restart container"
                        aria-label="Restart container"
                      >
                        <RotateCw className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
