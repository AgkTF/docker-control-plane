export interface Project {
  id: string;
  name: string;
  path: string;
  compose_file: string;
  has_missing_compose: boolean;
  created_at: string;
}

export interface Container {
  id: string;
  name: string;
  project: string;
  service: string;
  image: string;
  status: string;
  state: string;
  ports: PortMapping[];
}

export interface PortMapping {
  host: string;
  container: string;
}

export interface CreateProjectRequest {
  path: string;
  name?: string;
  compose_file?: string;
}

export interface ValidatePathRequest {
  path: string;
}

export interface ValidatePathResponse {
  valid: boolean;
  compose_file?: string;
  name?: string;
  error?: string;
}

export interface APIResponse<T> {
  data: T | null;
  error: {
    code: string;
    message: string;
  } | null;
}

export interface ContainerStats {
  cpu_percentage: number;
  memory_percentage: number;
  pids: number;
}
