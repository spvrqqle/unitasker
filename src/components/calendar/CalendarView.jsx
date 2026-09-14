import React, { useState, useEffect } from 'react';
import {
  Box,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import CalendarGrid from './CalendarGrid';
import EventList from './EventList';
import EventForm from './EventForm';
import { useEvents } from '../../hooks/useEvents';

const CalendarView = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const {
    events,
    loading,
    error,
    addEvent,
    editEvent,
    removeEvent,
    refreshEvents,
  } = useEvents();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formDate, setFormDate] = useState(null);

  // Update selected events when date or events change
  useEffect(() => {
    if (selectedDate) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const filtered = events.filter(event => {
        const eventDate = new Date(event.date);
        const eventDateStr = eventDate.toISOString().split('T')[0];
        return eventDateStr === dateStr;
      });
      setSelectedEvents(filtered);
    }
  }, [selectedDate, events]);

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const handleNavigate = (date) => {
    setCurrentDate(date);
  };

  const handleAddEvent = (date) => {
    setFormDate(date);
    setEditingEvent(null);
    setFormOpen(true);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setFormDate(null);
    setFormOpen(true);
  };

  const handleDeleteEvent = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await removeEvent(id);
        refreshEvents();
      } catch (err) {
        console.error('Failed to delete event:', err);
      }
    }
  };

  const handleSaveEvent = async (eventData) => {
    try {
      if (editingEvent) {
        await editEvent(editingEvent.id, eventData);
      } else {
        await addEvent(eventData);
      }
      setFormOpen(false);
      setEditingEvent(null);
      setFormDate(null);
      refreshEvents();
    } catch (err) {
      console.error('Failed to save event:', err);
    }
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingEvent(null);
    setFormDate(null);
  };

  const handleCloseEventList = () => {
    setSelectedDate(null);
  };

  return (
    <Box sx={{ 
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
    }}>
      {/* Calendar Grid - Full width */}
      <CalendarGrid
        currentDate={currentDate}
        events={events}
        onDateClick={handleDateClick}
        onEventClick={handleEditEvent}
        onAddEvent={handleAddEvent}
        onNavigate={handleNavigate}
      />

      {/* Selected Day Card - Full width at bottom */}
      {selectedDate && (
        <EventList
          events={selectedEvents}
          selectedDate={selectedDate}
          onEventClick={handleEditEvent}
          onEventDelete={handleDeleteEvent}
          onClose={handleCloseEventList}
          onAddEvent={handleAddEvent}
        />
      )}

      {/* Event Form Dialog */}
      <EventForm
        open={formOpen}
        onClose={handleCloseForm}
        onSave={handleSaveEvent}
        event={editingEvent}
        selectedDate={formDate}
      />
    </Box>
  );
};

export default CalendarView;