import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Fab,
  Paper,
  Stack,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Add as AddIcon,
  Sort as SortIcon,
} from '@mui/icons-material';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import TaskFilters from './TaskFilters';
import { useTasks } from '../../hooks/useTasks';

const TaskList = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const {
    tasks,
    loading,
    error,
    addTask,
    editTask,
    removeTask,
    refreshTasks,
  } = useTasks();

  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filters, setFilters] = useState({
    status: 'All',
    priority: 'All',
    sortBy: 'dueDate',
    sortDirection: 'asc',
    searchTerm: '',
  });

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // Status filter
    if (filters.status !== 'All') {
      result = result.filter(task => task.status === filters.status);
    }

    // Priority filter
    if (filters.priority !== 'All') {
      result = result.filter(task => task.priority === filters.priority);
    }

    // Search filter
    if (filters.searchTerm) {
      const search = filters.searchTerm.toLowerCase();
      result = result.filter(task =>
        task.title.toLowerCase().includes(search) ||
        (task.description && task.description.toLowerCase().includes(search))
      );
    }

    // Sort
    result.sort((a, b) => {
      let compareA = a[filters.sortBy] || '';
      let compareB = b[filters.sortBy] || '';

      if (filters.sortBy === 'dueDate' || filters.sortBy === 'createdAt') {
        compareA = compareA ? new Date(compareA).getTime() : 0;
        compareB = compareB ? new Date(compareB).getTime() : 0;
      } else if (filters.sortBy === 'priority') {
        const priorityOrder = { High: 3, Medium: 2, Low: 1 };
        compareA = priorityOrder[compareA] || 0;
        compareB = priorityOrder[compareB] || 0;
      } else {
        compareA = String(compareA).toLowerCase();
        compareB = String(compareB).toLowerCase();
      }

      if (compareA < compareB) return filters.sortDirection === 'asc' ? -1 : 1;
      if (compareA > compareB) return filters.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [tasks, filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      status: 'All',
      priority: 'All',
      sortBy: 'dueDate',
      sortDirection: 'asc',
      searchTerm: '',
    });
  };

  const handleAddTask = async (taskData) => {
    try {
      await addTask(taskData);
      setFormOpen(false);
    } catch (err) {
      console.error('Failed to add task:', err);
    }
  };

  const handleEditTask = async (taskData) => {
    try {
      await editTask(editingTask.id, taskData);
      setFormOpen(false);
      setEditingTask(null);
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const handleToggleComplete = async (id) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      const newStatus = task.status === 'Completed' ? 'To Do' : 'Completed';
      try {
        await editTask(id, { status: newStatus });
      } catch (err) {
        console.error('Failed to toggle task:', err);
      }
    }
  };

  const handleDeleteTask = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await removeTask(id);
      } catch (err) {
        console.error('Failed to delete task:', err);
      }
    }
  };

  const openEditForm = (task) => {
    setEditingTask(task);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingTask(null);
  };

  // Loading state
  if (loading && tasks.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3,
        flexWrap: 'wrap',
        gap: 2,
      }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
          Tasks
          <Typography component="span" color="text.secondary" sx={{ ml: 1, fontWeight: 400 }}>
            ({filteredTasks.length})
          </Typography>
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setFormOpen(true)}
        >
          New Task
        </Button>
      </Box>

      {/* Filters */}
      <TaskFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No tasks found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {tasks.length === 0 
              ? 'Get started by creating your first task!' 
              : 'Try adjusting your filters to see more tasks.'}
          </Typography>
          {tasks.length === 0 && (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setFormOpen(true)}
              sx={{ mt: 2 }}
            >
              Create First Task
            </Button>
          )}
        </Paper>
      ) : (
        <Box>
          {filteredTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onToggleComplete={handleToggleComplete}
              onEdit={openEditForm}
              onDelete={handleDeleteTask}
            />
          ))}
        </Box>
      )}

      {/* FAB for mobile */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="add task"
          sx={{
            position: 'fixed',
            bottom: 80,
            right: 16,
          }}
          onClick={() => setFormOpen(true)}
        >
          <AddIcon />
        </Fab>
      )}

      {/* Task Form Dialog */}
      <TaskForm
        open={formOpen}
        onClose={closeForm}
        onSave={editingTask ? handleEditTask : handleAddTask}
        task={editingTask}
      />
    </Box>
  );
};

export default TaskList;