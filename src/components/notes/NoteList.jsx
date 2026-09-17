import React, { useState, useMemo, useEffect } from 'react';
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
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Note as NoteIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import NoteCard from './NoteCard';
import NoteEditor from './NoteEditor';
import NoteFilters from './NoteFilters';
import { useNotes } from '../../hooks/useNotes';

const NoteList = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const {
    notes,
    tags,
    loading,
    error,
    addNote,
    editNote,
    removeNote,
    refreshNotes,
  } = useNotes();

  const [formOpen, setFormOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [filters, setFilters] = useState({
    searchTerm: '',
    selectedTag: '',
  });
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, note: null });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
  });

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  // Filter notes
  useEffect(() => {
    let result = notes || [];

    if (filters.selectedTag) {
      result = result.filter(
        note => note.tags && note.tags.includes(filters.selectedTag)
      );
    }
    if (filters.searchTerm) {
      const search = filters.searchTerm.toLowerCase();
      result = result.filter(
        note =>
          note.title.toLowerCase().includes(search) ||
          note.content.toLowerCase().includes(search) ||
          (note.tags && note.tags.some(tag => tag.toLowerCase().includes(search)))
      );
    }

    setFilteredNotes(result);
  }, [notes, filters]);

  const handleFilterChange = (newFilters) => setFilters(newFilters);

  const handleClearFilters = () => {
    setFilters({ searchTerm: '', selectedTag: '' });
  };

  const handleAddNote = async (noteData) => {
    try {
      await addNote(noteData);
      setFormOpen(false);
      showSnackbar('Note created', 'success');
    } catch (err) {
      showSnackbar('Failed to create note', 'error');
    }
  };

  const handleEditNote = async (noteData) => {
    try {
      await editNote(editingNote.id, noteData);
      setFormOpen(false);
      setEditingNote(null);
      showSnackbar('Note updated', 'success');
    } catch (err) {
      showSnackbar('Failed to update note', 'error');
    }
  };

  const handleDeleteClick = (id) => {
    const note = notes.find(n => n.id === id);
    setDeleteDialog({ open: true, note });
  };

  const handleDeleteConfirm = async () => {
    try {
      await removeNote(deleteDialog.note.id);
      showSnackbar('Note deleted', 'success');
    } catch (err) {
      showSnackbar('Failed to delete note', 'error');
    } finally {
      setDeleteDialog({ open: false, note: null });
    }
  };

  const openEditForm = (note) => {
    setEditingNote(note);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingNote(null);
  };

  if (loading && notes.length === 0) {
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
            Notes
            <Typography component="span" color="text.secondary" sx={{ ml: 1, fontWeight: 400, fontSize: '0.9rem' }}>
              ({filteredNotes.length})
            </Typography>
          </Typography>
          <Tooltip title="Refresh" arrow>
            <Button
              size="small"
              onClick={refreshNotes}
              aria-label="Refresh notes"
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
          aria-label="Create new note"
        >
          New Note
        </Button>
      </Box>

      {/* Filters */}
      <NoteFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        availableTags={tags}
      />

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* List */}
      {filteredNotes.length === 0 ? (
        <Paper sx={{
          p: 5,
          textAlign: 'center',
          bgcolor: 'background.paper',
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
        }}>
          <NoteIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {notes.length === 0 ? 'No notes yet' : 'No matching notes'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {notes.length === 0
              ? 'Capture your ideas, thoughts, and reminders.'
              : 'Try adjusting your filters or search term.'}
          </Typography>
          {notes.length === 0 ? (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setFormOpen(true)}
            >
              Create First Note
            </Button>
          ) : (
            <Button variant="outlined" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {filteredNotes.map(note => (
            <Grid item xs={12} sm={6} md={4} key={note.id}>
              <NoteCard
                note={note}
                onEdit={openEditForm}
                onDelete={handleDeleteClick}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* FAB for mobile */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="Add note"
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

      {/* Editor */}
      <NoteEditor
        open={formOpen}
        onClose={closeForm}
        onSave={editingNote ? handleEditNote : handleAddNote}
        note={editingNote}
        existingTags={tags}
      />

      {/* Delete confirmation */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, note: null })}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Note?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete <strong>{deleteDialog.note?.title || 'Untitled'}</strong>?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setDeleteDialog({ open: false, note: null })} color="inherit">
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

export default NoteList;