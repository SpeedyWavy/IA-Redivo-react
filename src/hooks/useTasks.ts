import { useCallback, useEffect, useRef, useState } from 'react';
import { MESSAGES } from '../utils/constants';
import type { Task, TaskFormData, UseTasksReturn } from '../types';
import {
  createTaskRequest,
  deleteTaskRequest,
  fetchAllTasks,
  toggleTaskRequest,
  updateTaskRequest,
} from '../services/taskApi';

// Valida se o título da tarefa contém algum texto após remover espaços.
function validateTaskTitle(taskData: TaskFormData): boolean {
  return taskData.title.trim().length > 0;
}

// Extrai a mensagem de erro mais útil para exibir na interface.
function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function useTasks(): UseTasksReturn {
  // Estado principal da lista e das flags de interface.
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Guarda a versão mais recente de tasks para as funções assíncronas.
  const tasksRef = useRef(tasks);

  // Busca a lista completa da API e atualiza o estado local.
  const fetchTasks = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchAllTasks();
      setTasks(data);
    } catch (err) {
      setError(MESSAGES.ERROR_LOAD);
      console.error('Erro ao carregar tarefas:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cria uma tarefa e aplica atualização otimista na interface.
  const createTask = useCallback(async (taskData: TaskFormData): Promise<boolean> => {
    if (!validateTaskTitle(taskData)) {
      setError(MESSAGES.ERROR_EMPTY_TITLE);
      return false;
    }

    setSubmitting(true);
    setError(null);

    try {
      const createdTask = await createTaskRequest(taskData);
      setTasks((prevTasks) => [createdTask, ...prevTasks]);
      return true;
    } catch (err) {
      setError(getErrorMessage(err, MESSAGES.ERROR_CREATE));
      return false;
    } finally {
      setSubmitting(false);
    }
  }, []);

  // Mantém tasksRef sincronizada com o estado mais recente.
  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  // Atualiza uma tarefa já existente com rollback em caso de falha.
  const updateTask = useCallback(async (id: number, taskData: TaskFormData): Promise<boolean> => {
    if (!validateTaskTitle(taskData)) {
      setError(MESSAGES.ERROR_EMPTY_TITLE);
      return false;
    }

    const previousTask = tasksRef.current.find((task) => task.id === id);

    setSubmitting(true);
    setError(null);

    if (previousTask) {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === id
            ? { ...task, ...taskData, updatedAt: new Date().toISOString() }
            : task,
        ),
      );
    }

    try {
      const updatedTask = await updateTaskRequest(id, taskData);
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === id ? updatedTask : task)),
      );
      return true;
    } catch (err) {
      if (previousTask) {
        setTasks((prevTasks) =>
          prevTasks.map((task) => (task.id === id ? previousTask : task)),
        );
      }
      setError(getErrorMessage(err, MESSAGES.ERROR_UPDATE));
      return false;
    } finally {
      setSubmitting(false);
    }
  }, []);

  // Alterna o status concluído da tarefa e reverte em caso de erro.
  const toggleTask = useCallback(async (id: number): Promise<void> => {
    const previousTask = tasksRef.current.find((task) => task.id === id);

    if (previousTask) {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === id ? { ...task, completed: !task.completed } : task,
        ),
      );
    }

    try {
      const updatedTask = await toggleTaskRequest(id);
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === id ? updatedTask : task)),
      );
    } catch (err) {
      if (previousTask) {
        setTasks((prevTasks) =>
          prevTasks.map((task) => (task.id === id ? previousTask : task)),
        );
      }
      setError(getErrorMessage(err, MESSAGES.ERROR_UPDATE));
      console.error('Erro ao alternar tarefa:', err);
    }
  }, []);

  // Remove a tarefa da lista imediatamente e restaura em caso de falha.
  const deleteTask = useCallback(async (id: number): Promise<void> => {
    const previousTask = tasksRef.current.find((task) => task.id === id);

    if (previousTask) {
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
    }

    try {
      await deleteTaskRequest(id);
    } catch (err) {
      if (previousTask) {
        setTasks((prevTasks) => [previousTask, ...prevTasks]);
      }
      setError(getErrorMessage(err, MESSAGES.ERROR_DELETE));
      console.error('Erro ao remover tarefa:', err);
    }
  }, []);

  // Carrega as tarefas ao montar o hook.
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    loading,
    error,
    submitting,
    createTask,
    updateTask,
    toggleTask,
    deleteTask,
    fetchTasks,
  };
}