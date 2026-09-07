import { 
  getDB, 
  addRecord, 
  getRecord, 
  getAllRecords, 
  updateRecord, 
  deleteRecord 
} from './database';

const STORE_NAME = 'events';

// Generate a unique ID
function generateId() {
  return crypto.randomUUID ? crypto.randomUUID() : 
    Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// Create a new event
export async function createEvent(eventData) {
  const event = {
    id: generateId(),
    title: eventData.title || 'Untitled Event',
    description: eventData.description || '',
    date: eventData.date || new Date().toISOString(),
    time: eventData.time || '',
    color: eventData.color || '#0d6efd',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  await addRecord(STORE_NAME, event);
  return event;
}

// Get all events
export async function getAllEvents() {
  return getAllRecords(STORE_NAME);
}

// Get a single event by ID
export async function getEvent(id) {
  return getRecord(STORE_NAME, id);
}

// Update an event
export async function updateEvent(id, updates) {
  const event = await getEvent(id);
  if (!event) throw new Error(`Event with id ${id} not found`);
  
  const updatedEvent = {
    ...event,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  await updateRecord(STORE_NAME, updatedEvent);
  return updatedEvent;
}

// Delete an event
export async function deleteEvent(id) {
  await deleteRecord(STORE_NAME, id);
}

// Get events for a specific month
export async function getEventsByMonth(year, month) {
  const allEvents = await getAllRecords(STORE_NAME);
  const startDate = new Date(year, month, 1);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(year, month + 1, 0);
  endDate.setHours(23, 59, 59, 999);
  
  return allEvents.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate >= startDate && eventDate <= endDate;
  });
}

// Get events for a specific day
export async function getEventsByDay(date) {
  const allEvents = await getAllRecords(STORE_NAME);
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  const nextDay = new Date(targetDate);
  nextDay.setDate(nextDay.getDate() + 1);
  
  return allEvents.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate >= targetDate && eventDate < nextDay;
  });
}

// Get events between two dates
export async function getEventsBetween(startDate, endDate) {
  const allEvents = await getAllRecords(STORE_NAME);
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  
  return allEvents.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate >= start && eventDate <= end;
  });
}