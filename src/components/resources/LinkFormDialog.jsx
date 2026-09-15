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
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const LinkFormDialog = ({ open, onClose, onSave, link = null }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isEditing = !!link;

  const [formData, setFormData] = useState({
    name: '',
    url: '',
    description: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (link) {
      setFormData({
        name: link.name || '',
        url: link.url || '',
        description: link.description || '',
      });
    } else {
      setFormData({ name: '', url: '', description: '' });
    }
    setErrors({});
  }, [link, open]);

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.url.trim()) newErrors.url = 'URL or path is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave({
      name: formData.name.trim(),
      url: formData.url.trim(),
      description: formData.description.trim(),
    });
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
        <span>{isEditing ? 'Edit Link' : 'Add Link'}</span>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField
            label="Name *"
            value={formData.name}
            onChange={handleChange('name')}
            error={!!errors.name}
            helperText={errors.name}
            fullWidth
            autoFocus
            placeholder="e.g., Project Proposal"
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <TextField
            label="URL or Path *"
            value={formData.url}
            onChange={handleChange('url')}
            error={!!errors.url}
            helperText={errors.url || 'Paste a URL (Google Drive, GitHub, etc.) or a local file path'}
            fullWidth
            placeholder="https://... or C:\\Users\\..."
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <TextField
            label="Description"
            value={formData.description}
            onChange={handleChange('description')}
            multiline
            rows={3}
            fullWidth
            placeholder="Optional notes about this resource..."
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained">
          {isEditing ? 'Save' : 'Add Link'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LinkFormDialog;