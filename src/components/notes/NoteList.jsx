import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Fab,
  Paper,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Grid,
  IconButton,
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

  // Filter notes based on search and tag
  useEffect(() => {
    let result = notes || [];
    
    // Tag filter
    if (filters.selectedTag) {
      result = result.filter(note => 
        note.tags && note.tags.includes(filters.selectedTag)
      );
    }
    
    // Search filter
    if (filters.searchTerm) {
      const search = filters.searchTerm.toLowerCase();
      result = result.filter(note =>
        note.title.toLowerCase().includes(search) ||
        note.content.toLowerCase().includes(search) ||
        (note.tags && note.tags.some(tag => tag.toLowerCase().includes(search)))
      );
    }
    
    setFilteredNotes(result);
  }, [notes, filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      searchTerm: '',
      selectedTag: '',
    });
  };

  const handleAddNote = async (noteData) => {
    try {
      await addNote(noteData);
      setFormOpen(false);
    } catch (err) {
      console.error('Failed to add note:', err);
    }
  };

  const handleEditNote = async (noteData) => {
    try {
      await editNote(editingNote.id, noteData);
      setFormOpen(false);
      setEditingNote(null);
    } catch (err) {
      console.error('Failed to update note:', err);
    }
  };

  const handleDeleteNote = async (id) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await removeNote(id);
      } catch (err) {
        console.error('Failed to delete note:', err);
      }
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

  // Loading state
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
        mb: 3,
        flexWrap: 'wrap',
        gap: 2,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
            Notes
            <Typography component="span" color="text.secondary" sx={{ ml: 1, fontWeight: 400 }}>
              ({filteredNotes.length})
            </Typography>
          </Typography>
          <IconButton size="small" onClick={refreshNotes} title="Refresh notes">
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setFormOpen(true)}
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

      {/* Note List */}
      {filteredNotes.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <NoteIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No notes found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {notes.length === 0 
              ? 'Get started by creating your first note!' 
              : 'Try adjusting your filters to see more notes.'}
          </Typography>
          {notes.length === 0 && (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setFormOpen(true)}
              sx={{ mt: 2 }}
            >
              Create First Note
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {filteredNotes.map((note) => (
            <Grid item xs={12} sm={6} md={4} key={note.id}>
              <NoteCard
                note={note}
                onEdit={openEditForm}
                onDelete={handleDeleteNote}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* FAB for mobile */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="add note"
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

      {/* Note Editor Dialog */}
      <NoteEditor
        open={formOpen}
        onClose={closeForm}
        onSave={editingNote ? handleEditNote : handleAddNote}
        note={editingNote}
        existingTags={tags}
      />
    </Box>
  );
};

export default NoteList;