import { 
  getDB, 
  addRecord, 
  getRecord, 
  getAllRecords, 
  updateRecord, 
  deleteRecord 
} from './database';

const STORE_NAME = 'notes';

// Generate a unique ID
function generateId() {
  return crypto.randomUUID ? crypto.randomUUID() : 
    Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// Create a new note
export async function createNote(noteData) {
  const note = {
    id: generateId(),
    title: noteData.title || 'Untitled',
    content: noteData.content || '',
    tags: noteData.tags || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  await addRecord(STORE_NAME, note);
  return note;
}

// Get all notes
export async function getAllNotes() {
  return getAllRecords(STORE_NAME);
}

// Get a single note by ID
export async function getNote(id) {
  return getRecord(STORE_NAME, id);
}

// Update a note
export async function updateNote(id, updates) {
  const note = await getNote(id);
  if (!note) throw new Error(`Note with id ${id} not found`);
  
  const updatedNote = {
    ...note,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  await updateRecord(STORE_NAME, updatedNote);
  return updatedNote;
}

// Delete a note
export async function deleteNote(id) {
  await deleteRecord(STORE_NAME, id);
}

// Get notes by tag
export async function getNotesByTag(tag) {
  const allNotes = await getAllNotes();
  return allNotes.filter(note => note.tags && note.tags.includes(tag));
}

// Get all unique tags
export async function getAllTags() {
  const allNotes = await getAllNotes();
  const tagSet = new Set();
  allNotes.forEach(note => {
    if (note.tags) {
      note.tags.forEach(tag => tagSet.add(tag));
    }
  });
  return Array.from(tagSet).sort();
}

// Search notes by title or content
export async function searchNotes(query) {
  const allNotes = await getAllNotes();
  const lowerQuery = query.toLowerCase();
  return allNotes.filter(note => 
    note.title.toLowerCase().includes(lowerQuery) ||
    note.content.toLowerCase().includes(lowerQuery) ||
    (note.tags && note.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
  );
}