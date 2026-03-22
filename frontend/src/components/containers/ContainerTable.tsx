import type { Container } from '../../api/types';

interface ContainerTableProps {
  containers: Container[];
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

  return (
    <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
  );
}

function formatPorts(ports: Container['ports']): string {
  if (ports.length === 0) return '-';
  
  return ports
    .map(p => `${p.host}:${p.container}`)
    .join(', ');
}

export function ContainerTable({ containers }: ContainerTableProps) {
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
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400 w-8">
              Status
            </th>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
              Service
            </th>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
              Name
            </th>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
              Image
            </th>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
              Ports
            </th>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
              State
            </th>
          </tr>
        </thead>
        <tbody>
          {containers.map((container) => (
            <tr
              key={container.id}
              className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
            >
              <td className="py-3 px-4">
                <StatusDot state={container.state} />
              </td>
              <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                {container.service}
              </td>
              <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                {container.name}
              </td>
              <td className="py-3 px-4 text-gray-500 dark:text-gray-400 font-mono text-sm">
                {container.image}
              </td>
              <td className="py-3 px-4 text-gray-500 dark:text-gray-400 text-sm">
                {formatPorts(container.ports)}
              </td>
              <td className="py-3 px-4">
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
