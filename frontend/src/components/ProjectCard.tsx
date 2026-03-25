import { Trash2 } from 'lucide-react';
import type { Project } from '../api/types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface ProjectCardProps {
  project: Project;
  onRemove: (id: string) => void;
  onViewContainers: (id: string) => void;
}

export function ProjectCard({
  project,
  onRemove,
  onViewContainers,
}: ProjectCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base truncate">{project.name}</CardTitle>
          <span className="text-sm text-muted-foreground">
            {new Date(project.created_at).toLocaleDateString()}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-3 font-mono text-sm truncate text-muted-foreground">
          {project.path}
        </p>
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="secondary">{project.compose_file}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewContainers(project.id)}
          >
            View Containers
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onRemove(project.id)}
          >
            <Trash2 className="w-4 h-4" />
            Remove
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
