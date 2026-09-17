import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Chip,
  IconButton,
  Box,
  Typography,
  Tooltip,
  useTheme,
  useMediaQuery,
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
  existingTags = [],
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isEditing = !!note;

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (note) {
      setFormData({
        title: note.title || '',
        content: note.content || '',
        tags: note.tags || [],
      });
    } else {
      setFormData({ title: '', content: '', tags: [] });
    }
    setTagInput('');
    setErrors({});
  }, [note, open]);

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  // ---------- Tag handling ----------

  const addTag = (rawTag) => {
    const tag = rawTag.trim().replace(/^#/, ''); // strip leading # if typed
    if (!tag) return;
    if (formData.tags.includes(tag)) {
      setTagInput('');
      return; // already added
    }
    setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
    setTagInput('');
  };

  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      e.stopPropagation();
      addTag(tagInput);
    } else if (e.key === 'Backspace' && !tagInput && formData.tags.length > 0) {
      // Remove last tag on empty backspace
      setFormData(prev => ({
        ...prev,
        tags: prev.tags.slice(0, -1),
      }));
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tagToRemove),
    }));
  };

  const handleAddTagClick = () => {
    addTag(tagInput);
  };

  // Filter suggestions: existing tags not yet added, matching what's typed
  const suggestions = (existingTags || [])
    .filter(t => !formData.tags.includes(t))
    .filter(t => !tagInput || t.toLowerCase().includes(tagInput.toLowerCase()))
    .slice(0, 8);

  // ---------- Save ----------

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    // Commit any remaining text in the tag input
    let finalTags = formData.tags;
    const pending = tagInput.trim().replace(/^#/, '');
    if (pending && !finalTags.includes(pending)) {
      finalTags = [...finalTags, pending];
    }
    onSave({
      title: formData.title.trim(),
      content: formData.content || '',
      tags: finalTags,
    });
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
        <IconButton onClick={onClose} size="small" aria-label="Close dialog">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField
            label="Note Title *"
            value={formData.title}
            onChange={handleChange('title')}
            error={!!errors.title}
            helperText={errors.title}
            fullWidth
            autoFocus
            placeholder="Enter note title..."
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <TextField
            label="Content"
            value={formData.content}
            onChange={handleChange('content')}
            multiline
            rows={10}
            fullWidth
            placeholder="Write your note here..."
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{
              '& .MuiInputBase-root': {
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                fontSize: '0.9rem',
                lineHeight: 1.6,
              },
            }}
          />

          {/* ---------- Tags ---------- */}
          <Box>
            <Typography
              variant="caption"
              sx={{ display: 'block', mb: 1, color: 'text.secondary', fontWeight: 500 }}
            >
              Tags
            </Typography>

            {/* Current tags */}
            {formData.tags.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
                {formData.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    icon={<LabelIcon sx={{ fontSize: 14 }} />}
                    onDelete={() => handleRemoveTag(tag)}
                    aria-label={`Remove tag ${tag}`}
                  />
                ))}
              </Box>
            )}

            {/* Input + Add button */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                size="small"
                value={tagInput}
                onChange={handleTagInputChange}
                onKeyDown={handleTagKeyDown}
                placeholder="Type a tag and press Enter"
                fullWidth
                helperText="Press Enter to add · Backspace to remove last"
                slotProps={{
                  htmlInput: {
                    'aria-label': 'New tag',
                  },
                }}
              />
              <Button
                variant="outlined"
                onClick={handleAddTagClick}
                disabled={!tagInput.trim()}
                startIcon={<AddIcon />}
                aria-label="Add tag"
                sx={{ flexShrink: 0, height: 40 }}
              >
                Add
              </Button>
            </Box>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <Box sx={{ mt: 1.5 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontSize: '0.7rem' }}>
                  Suggestions
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {suggestions.map(tag => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      variant="outlined"
                      onClick={() => addTag(tag)}
                      sx={{ cursor: 'pointer', fontSize: '0.7rem' }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained">
          {isEditing ? 'Update Note' : 'Create Note'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NoteEditor;