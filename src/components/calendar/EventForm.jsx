import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  IconButton,
  useTheme,
  useMediaQuery,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box
} from '@mui/material';
import CloseIcon from "@mui/icons-material/Close";

const COLORS = [
  { value: '#0d6efd', label: 'Blue' },
  { value: '#dc3545', label: 'Red' },
  { value: '#198754', label: 'Green' },
  { value: '#ffc107', label: 'Yellow' },
  { value: '#6f42c1', label: 'Purple' },
  { value: '#fd7e14', label: 'Orange' },
  { value: '#20c997', label: 'Teal' },
  { value: '#e83e8c', label: 'Pink' },
];

const EventForm = ({ open, onClose, onSave, event = null, selectedDate = null }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  const isEditing = !!event;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    color: '#0d6efd',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        description: event.description || '',
        date: event.date ? event.date.split('T')[0] : '',
        time: event.time || '',
        color: event.color || '#0d6efd',
      });
    } else {
      // Use selectedDate or today
      const today = selectedDate || new Date();
      const dateStr = today.toISOString().split('T')[0];
      setFormData({
        title: '',
        description: '',
        date: dateStr,
        time: '',
        color: '#0d6efd',
      });
    }
    setErrors({});
  }, [event, open, selectedDate]);

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    // Combine date and time
    let dateTime = formData.date;
    if (formData.time) {
      dateTime = `${formData.date}T${formData.time}`;
    }

    const dataToSave = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      date: dateTime,
      time: formData.time,
      color: formData.color,
    };

    onSave(dataToSave);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{isEditing ? 'Edit Event' : 'Create New Event'}</span>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* Title */}
          <TextField
            label="Event Title *"
            value={formData.title}
            onChange={handleChange('title')}
            error={!!errors.title}
            helperText={errors.title}
            fullWidth
            autoFocus
            placeholder="Enter event title..."
          />

          {/* Description */}
          <TextField
            label="Description"
            value={formData.description}
            onChange={handleChange('description')}
            multiline
            rows={3}
            fullWidth
            placeholder="Add details about this event..."
          />

          {/* Date */}
          <TextField
            label="Date *"
            type="date"
            value={formData.date}
            onChange={handleChange('date')}
            error={!!errors.date}
            helperText={errors.date}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />

          {/* Time */}
          <TextField
            label="Time"
            type="time"
            value={formData.time}
            onChange={handleChange('time')}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />

          {/* Color */}
          <FormControl fullWidth>
            <InputLabel>Color</InputLabel>
            <Select
              value={formData.color}
              onChange={handleChange('color')}
              label="Color"
              renderValue={(value) => (
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      backgroundColor: value,
                      border: '1px solid #ddd',
                    }}
                  />
                  <span>{COLORS.find(c => c.value === value)?.label || value}</span>
                </Stack>
              )}
            >
              {COLORS.map((color) => (
                <MenuItem key={color.value} value={color.value}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        backgroundColor: color.value,
                        border: '1px solid #ddd',
                      }}
                    />
                    <span>{color.label}</span>
                  </Stack>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
        >
          {isEditing ? 'Update Event' : 'Create Event'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EventForm;