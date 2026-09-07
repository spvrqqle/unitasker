import { useState, useEffect, useCallback } from 'react';
import { 
  getAllEvents, 
  createEvent, 
  updateEvent, 
  deleteEvent,
  getEventsByMonth,
  getEventsByDay,
} from '../services/event.service';

export function useEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load all events
  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const loadedEvents = await getAllEvents();
      setEvents(loadedEvents || []);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load events on mount
  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Add a new event
  const addEvent = useCallback(async (eventData) => {
    try {
      setError(null);
      const newEvent = await createEvent(eventData);
      setEvents(prev => [...(prev || []), newEvent]);
      return newEvent;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Edit an existing event
  const editEvent = useCallback(async (id, updates) => {
    try {
      setError(null);
      const updatedEvent = await updateEvent(id, updates);
      setEvents(prev => (prev || []).map(event => 
        event.id === id ? updatedEvent : event
      ));
      return updatedEvent;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Remove an event
  const removeEvent = useCallback(async (id) => {
    try {
      setError(null);
      await deleteEvent(id);
      setEvents(prev => (prev || []).filter(event => event.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Get events by month
  const getEventsByMonthFilter = useCallback(async (year, month) => {
    try {
      return await getEventsByMonth(year, month);
    } catch (err) {
      setError(err.message);
      return [];
    }
  }, []);

  // Get events by day
  const getEventsByDayFilter = useCallback(async (date) => {
    try {
      return await getEventsByDay(date);
    } catch (err) {
      setError(err.message);
      return [];
    }
  }, []);

  // Refresh events
  const refreshEvents = useCallback(() => {
    loadEvents();
  }, [loadEvents]);

  return {
    events: events || [],
    loading,
    error,
    addEvent,
    editEvent,
    removeEvent,
    getEventsByMonthFilter,
    getEventsByDayFilter,
    refreshEvents,
  };
}