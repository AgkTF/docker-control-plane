import type { Project, Container, CreateProjectRequest, ValidatePathResponse, APIResponse } from './types';

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

export async function getProject(id: string): Promise<Project> {
  return apiClient<Project>(`/projects/${id}`);
}

export async function createProject(request: CreateProjectRequest): Promise<Project> {
  return apiClient<Project>('/projects', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function deleteProject(id: string): Promise<void> {
  await apiClient<void>(`/projects/${id}`, {
    method: 'DELETE',
  });
}

export async function validatePath(path: string): Promise<ValidatePathResponse> {
  return apiClient<ValidatePathResponse>('/projects/validate', {
    method: 'POST',
    body: JSON.stringify({ path }),
  });
}

export async function getContainers(projectId: string): Promise<Container[]> {
  return apiClient<Container[]>(`/projects/${projectId}/containers`);
}

export async function startContainer(id: string): Promise<void> {
  await apiClient<void>(`/containers/${id}/start`, {
    method: 'POST',
  });
}

export async function stopContainer(id: string): Promise<void> {
  await apiClient<void>(`/containers/${id}/stop`, {
    method: 'POST',
  });
}

export async function restartContainer(id: string): Promise<void> {
  await apiClient<void>(`/containers/${id}/restart`, {
    method: 'POST',
  });
}
