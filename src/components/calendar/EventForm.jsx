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
  Box,
  Typography,
  Tooltip,
} from '@mui/material';
import {
  Close as CloseIcon,
  Check as CheckIcon,
} from '@mui/icons-material';

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

  const handleColorSelect = (colorValue) => {
    setFormData(prev => ({ ...prev, color: colorValue }));
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

  const selectedColorLabel = COLORS.find(c => c.value === formData.color)?.label || 'Custom';

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
            slotProps={{ inputLabel: { shrink: true } }}
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
            slotProps={{ inputLabel: { shrink: true } }}
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
            slotProps={{ inputLabel: { shrink: true } }}
          />

          {/* Time */}
          <TextField
            label="Time"
            type="time"
            value={formData.time}
            onChange={handleChange('time')}
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
          />

          {/* Color picker */}
          <Box>
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                mb: 1,
                color: 'text.secondary',
                fontWeight: 500,
              }}
            >
              Color
            </Typography>
            <Stack direction="row" spacing={1.25} flexWrap="wrap" useFlexGap>
              {COLORS.map((color) => {
                const isSelected = formData.color === color.value;
                return (
                  <Tooltip key={color.value} title={color.label} arrow>
                    <Box
                      onClick={() => handleColorSelect(color.value)}
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        backgroundColor: color.value,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: isSelected
                          ? `3px solid ${theme.palette.text.primary}`
                          : '2px solid transparent',
                        outline: isSelected
                          ? `2px solid ${theme.palette.background.paper}`
                          : 'none',
                        outlineOffset: '-4px',
                        transition: 'all 0.15s',
                        '&:hover': {
                          transform: 'scale(1.1)',
                          boxShadow: theme.shadows[3],
                        },
                      }}
                    >
                      {isSelected && (
                        <CheckIcon
                          sx={{
                            fontSize: 20,
                            color: '#fff',
                            filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.5))',
                          }}
                        />
                      )}
                    </Box>
                  </Tooltip>
                );
              })}
            </Stack>
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                mt: 1,
                color: 'text.secondary',
                fontSize: '0.7rem',
              }}
            >
              Selected: <strong>{selectedColorLabel}</strong>
            </Typography>
          </Box>
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