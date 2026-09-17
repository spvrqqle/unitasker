import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

const TaskForm = ({ open, onClose, onSave, task = null }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isEditing = !!task;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: null,
    priority: 'Medium',
    status: 'To Do',
    reminder: null,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
        priority: task.priority || 'Medium',
        status: task.status || 'To Do',
        reminder: task.reminder ? new Date(task.reminder) : null,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        dueDate: null,
        priority: 'Medium',
        status: 'To Do',
        reminder: null,
      });
    }
    setErrors({});
  }, [task, open]);

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleDateChange = (field) => (date) => {
    setFormData(prev => ({ ...prev, [field]: date }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave({
      title: formData.title.trim(),
      description: formData.description.trim(),
      dueDate: formData.dueDate ? formData.dueDate.toISOString() : null,
      priority: formData.priority,
      status: formData.status,
      reminder: formData.reminder ? formData.reminder.toISOString() : null,
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog
        open={open}
        onClose={onClose}
        fullScreen={fullScreen}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{isEditing ? 'Edit Task' : 'Create New Task'}</span>
          <IconButton onClick={onClose} size="small" aria-label="Close dialog">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Task Title *"
              value={formData.title}
              onChange={handleChange('title')}
              error={!!errors.title}
              helperText={errors.title}
              fullWidth
              autoFocus
              placeholder="Enter task title..."
              slotProps={{ inputLabel: { shrink: true } }}
            />

            <TextField
              label="Description"
              value={formData.description}
              onChange={handleChange('description')}
              multiline
              rows={3}
              fullWidth
              placeholder="Add details about this task..."
              slotProps={{ inputLabel: { shrink: true } }}
            />

            <DateTimePicker
              label="Due Date & Time"
              value={formData.dueDate}
              onChange={handleDateChange('dueDate')}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!errors.dueDate,
                  helperText: errors.dueDate,
                  slotProps: { inputLabel: { shrink: true } },
                },
              }}
            />

            <FormControl fullWidth>
              <InputLabel id="task-form-priority-label">Priority</InputLabel>
              <Select
                labelId="task-form-priority-label"
                value={formData.priority}
                onChange={handleChange('priority')}
                label="Priority"
              >
                <MenuItem value="High">🔴 High</MenuItem>
                <MenuItem value="Medium">🟡 Medium</MenuItem>
                <MenuItem value="Low">🟢 Low</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="task-form-status-label">Status</InputLabel>
              <Select
                labelId="task-form-status-label"
                value={formData.status}
                onChange={handleChange('status')}
                label="Status"
              >
                <MenuItem value="To Do">📋 To Do</MenuItem>
                <MenuItem value="In Progress">🔄 In Progress</MenuItem>
                <MenuItem value="Completed">✅ Completed</MenuItem>
              </Select>
            </FormControl>

            <DateTimePicker
              label="Set Reminder (Optional)"
              value={formData.reminder}
              onChange={handleDateChange('reminder')}
              slotProps={{
                textField: {
                  fullWidth: true,
                  helperText: 'You will be notified at this time',
                  slotProps: { inputLabel: { shrink: true } },
                },
              }}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained">
            {isEditing ? 'Update Task' : 'Create Task'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default TaskForm;