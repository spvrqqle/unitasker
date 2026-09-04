import { useState, useEffect, useCallback } from 'react';
import { 
  getAllTasks, 
  createTask, 
  updateTask, 
  deleteTask,
  getTasksDueToday,
  getTasksByStatus
} from '../services/task.service';

export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load all tasks
  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const loadedTasks = await getAllTasks();
      setTasks(loadedTasks);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load tasks on mount
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Add a new task
  const addTask = useCallback(async (taskData) => {
    try {
      setError(null);
      const newTask = await createTask(taskData);
      setTasks(prev => [...prev, newTask]);
      return newTask;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Edit an existing task
  const editTask = useCallback(async (id, updates) => {
    try {
      setError(null);
      const updatedTask = await updateTask(id, updates);
      setTasks(prev => prev.map(task => 
        task.id === id ? updatedTask : task
      ));
      return updatedTask;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Remove a task
  const removeTask = useCallback(async (id) => {
    try {
      setError(null);
      await deleteTask(id);
      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Get tasks due today
  const getTodayTasks = useCallback(async () => {
    try {
      return await getTasksDueToday();
    } catch (err) {
      setError(err.message);
      return [];
    }
  }, []);

  // Get tasks by status
  const getTasksByStatusFilter = useCallback(async (status) => {
    try {
      return await getTasksByStatus(status);
    } catch (err) {
      setError(err.message);
      return [];
    }
  }, []);

  // Refresh tasks
  const refreshTasks = useCallback(() => {
    loadTasks();
  }, [loadTasks]);

  return {
    tasks,
    loading,
    error,
    addTask,
    editTask,
    removeTask,
    getTodayTasks,
    getTasksByStatusFilter,
    refreshTasks,
  };
}