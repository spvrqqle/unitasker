import { 
  addRecord, 
  getAllRecords, 
  updateRecord, 
  deleteRecord,
  getRecord,
} from './database';

const STORE_NAME = 'timerSessions';

// Generate a unique ID
function generateId() {
  return crypto.randomUUID ? crypto.randomUUID() : 
    Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// Create a new timer session
export async function createTimerSession({
  mode = 'focus',           // 'focus' | 'shortBreak' | 'longBreak'
  duration = 25 * 60,       // seconds
}) {
  const session = {
    id: generateId(),
    mode,
    duration,
    startedAt: new Date().toISOString(),
    completedAt: null,
    status: 'running',       // 'running' | 'completed' | 'interrupted'
  };
  
  await addRecord(STORE_NAME, session);
  return session;
}

// Get a session by ID
export async function getTimerSession(id) {
  return getRecord(STORE_NAME, id);
}

// Complete a timer session
export async function completeTimerSession(id) {
  const session = await getTimerSession(id);
  if (!session) return null;
  
  session.completedAt = new Date().toISOString();
  session.status = 'completed';
  await updateRecord(STORE_NAME, session);
  return session;
}

// Interrupt (abandon) a timer session
export async function interruptTimerSession(id) {
  const session = await getTimerSession(id);
  if (!session) return null;
  
  session.status = 'interrupted';
  await updateRecord(STORE_NAME, session);
  return session;
}

// Get all timer sessions
export async function getAllTimerSessions() {
  return getAllRecords(STORE_NAME);
}

// Delete a session
export async function deleteTimerSession(id) {
  await deleteRecord(STORE_NAME, id);
}

// Get sessions from today
export async function getTodayTimerSessions() {
  const all = await getAllRecords(STORE_NAME);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return all.filter(session => {
    const sessionDate = new Date(session.startedAt);
    sessionDate.setHours(0, 0, 0, 0);
    return sessionDate.getTime() === today.getTime();
  });
}

// Get stats: completed focus sessions today, total focus seconds today
export async function getTodayStats() {
  const sessions = await getTodayTimerSessions();
  const completedFocus = sessions.filter(
    s => s.mode === 'focus' && s.status === 'completed'
  );
  
  const totalFocusSeconds = completedFocus.reduce((sum, s) => sum + (s.duration || 0), 0);
  
  return {
    completedSessions: completedFocus.length,
    totalFocusSeconds,
  };
}

// Clear all session history
export async function clearAllTimerSessions() {
  const all = await getAllRecords(STORE_NAME);
  for (const session of all) {
    await deleteRecord(STORE_NAME, session.id);
  }
}