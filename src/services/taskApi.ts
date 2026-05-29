import { API_URL } from '../utils/constants';
import type { Task, TaskFormData } from '../types';

async function readErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const data = await response.json();
    return data.error || fallback;
  } catch {
    return fallback;
  }
}

async function requestJson<T>(url: string, options: RequestInit = {}, fallback: string): Promise<T> {
  const response = await fetch(url, options);

  if (!response.ok) {
    const message = await readErrorMessage(response, fallback);
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export async function fetchAllTasks(signal?: AbortSignal): Promise<Task[]> {
  return requestJson<Task[]>(API_URL, { signal }, 'Erro ao carregar tarefas');
}

export async function createTaskRequest(taskData: TaskFormData): Promise<Task> {
  return requestJson<Task>(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...taskData, completed: false }),
  }, 'Erro ao criar tarefa');
}

export async function updateTaskRequest(id: number, taskData: TaskFormData): Promise<Task> {
  return requestJson<Task>(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData),
  }, 'Erro ao atualizar tarefa');
}

export async function toggleTaskRequest(id: number): Promise<Task> {
  return requestJson<Task>(`${API_URL}/${id}/toggle`, { method: 'PATCH' }, 'Erro ao alternar tarefa');
}

export async function deleteTaskRequest(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });

  if (!response.ok) {
    const message = await readErrorMessage(response, 'Erro ao remover tarefa');
    throw new Error(message);
  }
}
