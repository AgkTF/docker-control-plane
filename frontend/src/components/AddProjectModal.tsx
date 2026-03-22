import { useState, useEffect } from 'react';
import { X, Check, AlertCircle } from 'lucide-react';

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (path: string) => void;
  isSubmitting: boolean;
}

export function AddProjectModal({ isOpen, onClose, onSubmit, isSubmitting }: AddProjectModalProps) {
  const [path, setPath] = useState('');
  const [validationState, setValidationState] = useState<{
    status: 'idle' | 'validating' | 'valid' | 'invalid';
    message: string;
    composeFile?: string;
  }>({ status: 'idle', message: '' });

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setPath('');
      setValidationState({ status: 'idle', message: '' });
    }
  }, [isOpen]);

  // Debounced validation
  useEffect(() => {
    if (!path.trim()) {
      setValidationState({ status: 'idle', message: '' });
      return;
    }

    setValidationState({ status: 'validating', message: 'Checking...' });

    const timer = setTimeout(async () => {
      try {
        const response = await fetch('/api/projects/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path }),
        });
        const data = await response.json();
        
        if (data.data?.valid) {
          setValidationState({
            status: 'valid',
            message: `✓ Detected: ${data.data.compose_file}`,
            composeFile: data.data.compose_file,
          });
        } else {
          setValidationState({
            status: 'invalid',
            message: `✕ ${data.data?.error || 'Validation failed'}`,
          });
        }
      } catch (err) {
        setValidationState({
          status: 'invalid',
          message: '✕ Validation failed',
        });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [path]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validationState.status === 'valid' && !isSubmitting) {
      onSubmit(path);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
          <h2 className="font-semibold text-gray-900 dark:text-white text-lg">Add Project</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Project Path <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              placeholder="/path/to/project"
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded font-mono text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
              disabled={isSubmitting}
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Enter the directory containing your docker-compose.yml or compose.yaml file
            </p>
          </div>

          {validationState.message && (
            <div className={`flex items-center gap-2 text-sm mb-4 ${
              validationState.status === 'valid' ? 'text-green-600 dark:text-green-400' : 
              validationState.status === 'invalid' ? 'text-red-600 dark:text-red-400' : 
              'text-gray-500 dark:text-gray-400'
            }`}>
              {validationState.status === 'valid' && <Check className="w-4 h-4" />}
              {validationState.status === 'invalid' && <AlertCircle className="w-4 h-4" />}
              <span>{validationState.message}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 border border-gray-300 dark:border-slate-600 rounded font-medium text-sm text-gray-700 dark:text-gray-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={validationState.status !== 'valid' || isSubmitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Adding...' : 'Add Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
