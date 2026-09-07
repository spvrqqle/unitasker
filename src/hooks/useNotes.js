import { useState, useEffect, useCallback } from 'react';
import { 
  getAllNotes, 
  createNote, 
  updateNote, 
  deleteNote,
  getNotesByTag,
  getAllTags,
  searchNotes
} from '../services/note.service';

export function useNotes() {
  const [notes, setNotes] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load all notes
  const loadNotes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const loadedNotes = await getAllNotes();
      setNotes(loadedNotes || []);
      const loadedTags = await getAllTags();
      setTags(loadedTags || []);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load notes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load notes on mount
  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  // Add a new note
  const addNote = useCallback(async (noteData) => {
    try {
      setError(null);
      const newNote = await createNote(noteData);
      setNotes(prev => [...(prev || []), newNote]);
      // Refresh tags
      const updatedTags = await getAllTags();
      setTags(updatedTags || []);
      return newNote;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Edit an existing note
  const editNote = useCallback(async (id, updates) => {
    try {
      setError(null);
      const updatedNote = await updateNote(id, updates);
      setNotes(prev => (prev || []).map(note => 
        note.id === id ? updatedNote : note
      ));
      // Refresh tags
      const updatedTags = await getAllTags();
      setTags(updatedTags || []);
      return updatedNote;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Remove a note
  const removeNote = useCallback(async (id) => {
    try {
      setError(null);
      await deleteNote(id);
      setNotes(prev => (prev || []).filter(note => note.id !== id));
      // Refresh tags
      const updatedTags = await getAllTags();
      setTags(updatedTags || []);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Get notes by tag
  const getNotesByTagFilter = useCallback(async (tag) => {
    try {
      return await getNotesByTag(tag);
    } catch (err) {
      setError(err.message);
      return [];
    }
  }, []);

  // Search notes
  const searchNotesByQuery = useCallback(async (query) => {
    try {
      if (!query || query.trim() === '') {
        return notes || [];
      }
      return await searchNotes(query);
    } catch (err) {
      setError(err.message);
      return [];
    }
  }, [notes]);

  // Refresh notes
  const refreshNotes = useCallback(() => {
    loadNotes();
  }, [loadNotes]);

  return {
    notes: notes || [],
    tags: tags || [],
    loading,
    error,
    addNote,
    editNote,
    removeNote,
    getNotesByTagFilter,
    searchNotesByQuery,
    refreshNotes,
  };
}