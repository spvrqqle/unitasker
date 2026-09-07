import { addRecord, getAllRecords, updateRecord } from './database';

const STORE_NAME = 'timerSessions';

// Generate a unique ID
function generateId() {
  return crypto.randomUUID ? crypto.randomUUID() : 
    Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// Create a new timer session
export async function createTimerSession(duration) {
  const session = {
    id: generateId(),
    duration: duration, // in seconds
    startedAt: new Date().toISOString(),
    completedAt: null,
    status: 'running', // 'running', 'completed', 'interrupted'
  };
  
  await addRecord(STORE_NAME, session);
  return session;
}

// Complete a timer session
export async function completeTimerSession(id) {
  const sessions = await getAllRecords(STORE_NAME);
  const session = sessions.find(s => s.id === id);
  if (session) {
    session.completedAt = new Date().toISOString();
    session.status = 'completed';
    await updateRecord(STORE_NAME, session);
    return session;
  }
  return null;
}

// Interrupt a timer session
export async function interruptTimerSession(id) {
  const sessions = await getAllRecords(STORE_NAME);
  const session = sessions.find(s => s.id === id);
  if (session) {
    session.status = 'interrupted';
    await updateRecord(STORE_NAME, session);
    return session;
  }
  return null;
}

// Get all timer sessions
export async function getAllTimerSessions() {
  return getAllRecords(STORE_NAME);
}

// Get today's timer sessions
export async function getTodayTimerSessions() {
  const allSessions = await getAllRecords(STORE_NAME);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return allSessions.filter(session => {
    const sessionDate = new Date(session.startedAt);
    sessionDate.setHours(0, 0, 0, 0);
    return sessionDate.getTime() === today.getTime();
  });
}