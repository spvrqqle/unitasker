import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Stack,
  Chip,
  IconButton,
  useTheme,
  useMediaQuery,
  Autocomplete,
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Label as LabelIcon,
} from '@mui/icons-material';

const NoteEditor = ({ 
  open, 
  onClose, 
  onSave, 
  note = null, 
  existingTags = [] 
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  const isEditing = !!note;

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: [],
  });

  const [errors, setErrors] = useState({});
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (note) {
      setFormData({
        title: note.title || '',
        content: note.content || '',
        tags: note.tags || [],
      });
    } else {
      setFormData({
        title: '',
        content: '',
        tags: [],
      });
    }
    setErrors({});
    setNewTag('');
  }, [note, open]);

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleTagsChange = (event, newTags) => {
    setFormData(prev => ({ ...prev, tags: newTags }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({ 
        ...prev, 
        tags: [...prev.tags, newTag.trim()] 
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && newTag.trim()) {
      event.preventDefault();
      handleAddTag();
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const dataToSave = {
      title: formData.title.trim(),
      content: formData.content || '',
      tags: formData.tags || [],
    };

    onSave(dataToSave);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{isEditing ? 'Edit Note' : 'Create New Note'}</span>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* Title */}
          <TextField
            label="Note Title *"
            value={formData.title}
            onChange={handleChange('title')}
            error={!!errors.title}
            helperText={errors.title}
            fullWidth
            autoFocus
            placeholder="Enter note title..."
          />

          {/* Content */}
          <TextField
            label="Content"
            value={formData.content}
            onChange={handleChange('content')}
            multiline
            rows={10}
            fullWidth
            placeholder="Write your note here..."
            sx={{
              '& .MuiInputBase-root': {
                fontFamily: 'monospace',
                fontSize: '0.9rem',
                lineHeight: 1.6,
              }
            }}
          />

          {/* Tags */}
          <Box>
            <Autocomplete
              multiple
              freeSolo
              options={existingTags || []}
              value={formData.tags || []}
              onChange={handleTagsChange}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    key={index}
                    label={option}
                    {...getTagProps({ index })}
                    onDelete={() => handleRemoveTag(option)}
                    size="small"
                    icon={<LabelIcon sx={{ fontSize: 14 }} />}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Tags"
                  placeholder="Add tags..."
                  helperText="Type a tag and press Enter to add"
                />
              )}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.target.value) {
                  e.preventDefault();
                  const value = e.target.value.trim();
                  if (value && !formData.tags.includes(value)) {
                    setFormData(prev => ({
                      ...prev,
                      tags: [...prev.tags, value]
                    }));
                    // Clear the input
                    setTimeout(() => {
                      const input = document.querySelector('input[placeholder="Add tags..."]');
                      if (input) input.value = '';
                    }, 0);
                  }
                }
              }}
            />
          </Box>

          {/* Current Tags Display */}
          {formData.tags && formData.tags.length > 0 && (
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Current Tags:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {formData.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    size="small"
                    onDelete={() => handleRemoveTag(tag)}
                    icon={<LabelIcon sx={{ fontSize: 14 }} />}
                  />
                ))}
              </Box>
            </Box>
          )}
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
          {isEditing ? 'Update Note' : 'Create Note'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NoteEditor;