export interface Project {
  id: string;
  name: string;
  path: string;
  compose_file: string;
  created_at: string;
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
