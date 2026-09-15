import { openDB } from 'idb';

const DB_NAME = 'UniTaskerDB';
const DB_VERSION = 3;   // ← bumped from 2 to 3

let dbInstance = null;

export async function getDB() {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion) {
      console.log(`Upgrading DB from ${oldVersion} to ${newVersion}`);
      
      // Tasks store
      if (!db.objectStoreNames.contains('tasks')) {
        const taskStore = db.createObjectStore('tasks', { keyPath: 'id' });
        taskStore.createIndex('by-status', 'status');
        taskStore.createIndex('by-dueDate', 'dueDate');
        taskStore.createIndex('by-priority', 'priority');
      }

      // Notes store
      if (!db.objectStoreNames.contains('notes')) {
        const noteStore = db.createObjectStore('notes', { keyPath: 'id' });
        noteStore.createIndex('by-title', 'title');
        noteStore.createIndex('by-tags', 'tags', { multiEntry: true });
      }

      // Events store
      if (!db.objectStoreNames.contains('events')) {
        const eventStore = db.createObjectStore('events', { keyPath: 'id' });
        eventStore.createIndex('by-date', 'date');
      }

      // Resources store
      if (!db.objectStoreNames.contains('resources')) {
        const resourceStore = db.createObjectStore('resources', { keyPath: 'id' });
        resourceStore.createIndex('by-type', 'type');
        resourceStore.createIndex('by-uploadedAt', 'uploadedAt');
        resourceStore.createIndex('by-name', 'name');
        resourceStore.createIndex('by-lastAccessed', 'lastAccessed');
      }

      // Pomodoro timer state store
      if (!db.objectStoreNames.contains('pomodoro')) {
        db.createObjectStore('pomodoro', { keyPath: 'id' });
      }

      // Settings store
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'id' });
      }

      // Timer sessions store — REQUIRED for the Timer module
      if (!db.objectStoreNames.contains('timerSessions')) {
        const timerStore = db.createObjectStore('timerSessions', { keyPath: 'id' });
        timerStore.createIndex('by-date', 'startedAt');
        timerStore.createIndex('by-status', 'status');
        timerStore.createIndex('by-mode', 'mode');
      }
    },
  });

  return dbInstance;
}

// ---------- Generic CRUD ----------

export async function addRecord(storeName, record) {
  const db = await getDB();
  return db.add(storeName, record);
}

export async function getRecord(storeName, id) {
  const db = await getDB();
  return db.get(storeName, id);
}

export async function getAllRecords(storeName) {
  const db = await getDB();
  return db.getAll(storeName);
}

export async function updateRecord(storeName, record) {
  const db = await getDB();
  return db.put(storeName, record);
}

export async function deleteRecord(storeName, id) {
  const db = await getDB();
  return db.delete(storeName, id);
}

export async function clearStore(storeName) {
  const db = await getDB();
  return db.clear(storeName);
}

// ---------- File System handle helpers (kept for compatibility) ----------

export function serializeFileHandle(handle) {
  return handle || undefined;
}

export function deserializeFileHandle(serialized) {
  return serialized || undefined;
}