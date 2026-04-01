import { useState, useEffect } from 'react';
import { Check, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (path: string) => void;
  isSubmitting: boolean;
}

export function AddProjectModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: AddProjectModalProps) {
  const [path, setPath] = useState('');
  const [validationState, setValidationState] = useState<{
    status: 'idle' | 'validating' | 'valid' | 'invalid';
    message: string;
    composeFile?: string;
  }>({ status: 'idle', message: '' });

  useEffect(() => {
    if (isOpen) {
      setPath('');
      setValidationState({ status: 'idle', message: '' });
    }
  }, [isOpen]);

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
            message: `Detected: ${data.data.compose_file}`,
            composeFile: data.data.compose_file,
          });
        } else {
          setValidationState({
            status: 'invalid',
            message: data.data?.error || 'Validation failed',
          });
        }
      } catch {
        setValidationState({
          status: 'invalid',
          message: 'Validation failed',
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Project</DialogTitle>
            <DialogDescription>
              Enter the directory containing your docker-compose.yml or compose.yaml file
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="project-path">
                Project Path <span className="text-red-500">*</span>
              </Label>
              <Input
                id="project-path"
                type="text"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                placeholder="/path/to/project"
                autoFocus
                disabled={isSubmitting}
              />
            </div>

            {validationState.message && (
              <div
                className={`flex items-center gap-2 text-sm ${
                  validationState.status === 'valid'
                    ? 'text-green-600 dark:text-green-400'
                    : validationState.status === 'invalid'
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-muted-foreground'
                }`}
              >
                {validationState.status === 'valid' && (
                  <Check className="w-4 h-4" />
                )}
                {validationState.status === 'invalid' && (
                  <AlertCircle className="w-4 h-4" />
                )}
                <span>{validationState.message}</span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={validationState.status !== 'valid' || isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
