import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Fab,
  Paper,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  TaskAlt as TaskIcon,
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
  const [deleteDialog, setDeleteDialog] = useState({ open: false, task: null });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
  });

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  // Filter + sort
  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    if (filters.status !== 'All') {
      result = result.filter(t => t.status === filters.status);
    }
    if (filters.priority !== 'All') {
      result = result.filter(t => t.priority === filters.priority);
    }
    if (filters.searchTerm) {
      const search = filters.searchTerm.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(search) ||
        (t.description && t.description.toLowerCase().includes(search))
      );
    }

    result.sort((a, b) => {
      let cmpA = a[filters.sortBy];
      let cmpB = b[filters.sortBy];

      if (filters.sortBy === 'dueDate' || filters.sortBy === 'createdAt') {
        cmpA = cmpA ? new Date(cmpA).getTime() : 0;
        cmpB = cmpB ? new Date(cmpB).getTime() : 0;
      } else if (filters.sortBy === 'priority') {
        const order = { High: 3, Medium: 2, Low: 1 };
        cmpA = order[cmpA] || 0;
        cmpB = order[cmpB] || 0;
      } else {
        cmpA = String(cmpA || '').toLowerCase();
        cmpB = String(cmpB || '').toLowerCase();
      }

      if (cmpA < cmpB) return filters.sortDirection === 'asc' ? -1 : 1;
      if (cmpA > cmpB) return filters.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [tasks, filters]);

  const handleFilterChange = (newFilters) => setFilters(newFilters);

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
      showSnackbar('Task created', 'success');
    } catch (err) {
      showSnackbar('Failed to create task', 'error');
    }
  };

  const handleEditTask = async (taskData) => {
    try {
      await editTask(editingTask.id, taskData);
      setFormOpen(false);
      setEditingTask(null);
      showSnackbar('Task updated', 'success');
    } catch (err) {
      showSnackbar('Failed to update task', 'error');
    }
  };

  const handleToggleComplete = async (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const newStatus = task.status === 'Completed' ? 'To Do' : 'Completed';
    try {
      await editTask(id, { status: newStatus });
      showSnackbar(
        newStatus === 'Completed' ? 'Task completed 🎉' : 'Task reopened',
        'success'
      );
    } catch (err) {
      showSnackbar('Failed to update task', 'error');
    }
  };

  const handleDeleteClick = (id) => {
    const task = tasks.find(t => t.id === id);
    setDeleteDialog({ open: true, task });
  };

  const handleDeleteConfirm = async () => {
    try {
      await removeTask(deleteDialog.task.id);
      showSnackbar('Task deleted', 'success');
    } catch (err) {
      showSnackbar('Failed to delete task', 'error');
    } finally {
      setDeleteDialog({ open: false, task: null });
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
        mb: 2,
        flexWrap: 'wrap',
        gap: 2,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
            Tasks
            <Typography component="span" color="text.secondary" sx={{ ml: 1, fontWeight: 400, fontSize: '0.9rem' }}>
              ({filteredTasks.length})
            </Typography>
          </Typography>
          <Tooltip title="Refresh" arrow>
            <Button
              size="small"
              onClick={refreshTasks}
              aria-label="Refresh tasks"
              sx={{ minWidth: 0, p: 0.5 }}
            >
              <RefreshIcon fontSize="small" />
            </Button>
          </Tooltip>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setFormOpen(true)}
          aria-label="Create new task"
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

      {/* List */}
      {filteredTasks.length === 0 ? (
        <Paper sx={{
          p: 5,
          textAlign: 'center',
          bgcolor: 'background.paper',
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
        }}>
          <TaskIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {tasks.length === 0 ? 'No tasks yet' : 'No matching tasks'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {tasks.length === 0
              ? 'Get started by creating your first task.'
              : 'Try adjusting your filters or search term.'}
          </Typography>
          {tasks.length === 0 ? (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setFormOpen(true)}
            >
              Create First Task
            </Button>
          ) : (
            <Button variant="outlined" onClick={handleClearFilters}>
              Clear Filters
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
              onDelete={handleDeleteClick}
            />
          ))}
        </Box>
      )}

      {/* FAB for mobile */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="Add task"
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

      {/* Task form */}
      <TaskForm
        open={formOpen}
        onClose={closeForm}
        onSave={editingTask ? handleEditTask : handleAddTask}
        task={editingTask}
      />

      {/* Delete confirmation */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, task: null })}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Task?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete <strong>{deleteDialog.task?.title}</strong>?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setDeleteDialog({ open: false, task: null })} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2500}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TaskList;