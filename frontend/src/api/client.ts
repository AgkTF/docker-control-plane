import type { Project, CreateProjectRequest, ValidatePathResponse, APIResponse } from './types';

const API_BASE = '/api';

async function apiClient<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  const data: APIResponse<T> = await response.json();

  if (data.error) {
    throw new Error(data.error.message);
  }

  if (data.data === null) {
    throw new Error('No data returned');
  }

  return data.data;
}

export async function listProjects(): Promise<Project[]> {
  return apiClient<Project[]>('/projects');
}

export async function createProject(request: CreateProjectRequest): Promise<Project> {
  return apiClient<Project>('/projects', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function validatePath(path: string): Promise<ValidatePathResponse> {
  return apiClient<ValidatePathResponse>('/projects/validate', {
    method: 'POST',
    body: JSON.stringify({ path }),
  });
}

export async function deleteProject(id: string): Promise<void> {
  await apiClient<void>(`/projects/${id}`, {
    method: 'DELETE',
  });
}
