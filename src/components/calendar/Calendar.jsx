// src/components/calendar/Calendar.jsx
import React, { useState } from "react";
import {
  Box, Typography, IconButton, Button, Stack, Paper, Divider, 
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Chip
} from "@mui/material";
import { 
  ChevronLeft, ChevronRight, Add as AddIcon, 
  NotificationsNone as BellIcon, 
  LightModeOutlined as SunIcon
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";

// --- MOCK DATA (Replace with your existing events data/table) ---
const MOCK_EVENTS = [
  { id: 1, title: "Team Meeting", date: "2026-09-04", start: "10:00", end: "11:00", location: "Zoom" },
  { id: 2, title: "Design Review", date: "2026-09-04", start: "14:00", end: "15:00", location: "Room 204" },
  { id: 3, title: "Project Deadline", date: "2026-09-09", start: "09:00", end: "17:00", location: "Office" },
  { id: 4, title: "Lunch with Client", date: "2026-09-15", start: "12:30", end: "13:30", location: "Cafe" },
];

const formatDateKey = (date) => date.toISOString().split('T')[0];
const isSameDay = (d1, d2) => d1.toDateString() === d2.toDateString();

const Calendar = () => {
  const theme = useTheme();
  
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [selectedDate, setSelectedDate] = useState(new Date()); 
  const [viewMode, setViewMode] = useState("Month"); 
  const [events, setEvents] = useState(MOCK_EVENTS);
  
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", date: "", start: "", end: "", location: "" });

  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startDayIndex = firstDayOfMonth.getDay(); 
    const previousMonthLastDay = new Date(year, month, 0).getDate();
    const daysArray = [];
    
    for (let i = startDayIndex - 1; i >= 0; i--) {
      daysArray.push(new Date(year, month - 1, previousMonthLastDay - i));
    }
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      daysArray.push(new Date(year, month, i));
    }
    const remainingDays = 7 - (daysArray.length % 7);
    if (remainingDays < 7) {
      for (let i = 1; i <= remainingDays; i++) {
        daysArray.push(new Date(year, month + 1, i));
      }
    }
    return daysArray;
  };

  const calendarDays = getCalendarDays();
  const today = new Date();
  
  const handleDayClick = (day) => {
    setSelectedDate(day);
    setCurrentDate(day); 
  };

  const changeMonth = (offset) => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  const handleAddEvent = () => {
    if (newEvent.title && newEvent.date) {
      setEvents([...events, { ...newEvent, id: Date.now() }]);
      setIsEventModalOpen(false);
      setNewEvent({ title: "", date: "", start: "", end: "", location: "" });
      setSelectedDate(new Date(newEvent.date));
    }
  };

  const selectedDayEvents = events.filter(e => e.date === formatDateKey(selectedDate));

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column", p: 3, bgcolor: theme.palette.background.default, overflow: "hidden" }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h4" fontWeight="bold">Calendar</Typography>
        <Stack direction="row" spacing={1}>
          <IconButton><BellIcon /></IconButton>
          <IconButton><SunIcon /></IconButton> 
        </Stack>
      </Stack>

      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Button color="inherit" onClick={() => changeMonth(-1)}><ChevronLeft /></Button>
          <Typography variant="h6" sx={{ minWidth: 150, textAlign: "center" }}>
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </Typography>
          <Button color="inherit" onClick={() => changeMonth(1)}><ChevronRight /></Button>
        </Stack>

        <Stack direction="row" spacing={2} alignItems="center">
          <Stack direction="row" spacing={1} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 0.5 }}>
            {['Day', 'Week', 'Month'].map((mode) => (
              <Button 
                key={mode} 
                size="small" 
                variant={viewMode === mode ? "contained" : "text"}
                onClick={() => setViewMode(mode)}
              >
                {mode}
              </Button>
            ))}
          </Stack>
          
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setIsEventModalOpen(true)}>
            + Event
          </Button>
        </Stack>
      </Stack>

      <Paper variant="outlined" sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', borderBottom: 1, borderColor: 'divider', bgcolor: theme.palette.action.hover }}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <Box key={i} sx={{ flex: 1, py: 1, textAlign: 'center', borderRight: i < 6 ? 1 : 0, borderColor: 'divider' }}>
              <Typography variant="caption" fontWeight="bold">{day}</Typography>
            </Box>
          ))}
        </Box>

        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {[0, 1, 2, 3, 4].map(rowIndex => {
            const startIndex = rowIndex * 7;
            const weekDays = calendarDays.slice(startIndex, startIndex + 7);
            if (weekDays.length === 0) return null;

            return (
              <Box key={rowIndex} sx={{ flex: 1, display: 'flex', borderBottom: rowIndex < 4 ? 1 : 0, borderColor: 'divider' }}>
                {weekDays.map((day, i) => (
                  <Box key={i} sx={{ flex: 1, borderRight: i < 6 ? 1 : 0, borderColor: 'divider', minWidth: 0 }}>
                    <DayCell day={day} today={today} selectedDate={selectedDate} events={events} onClick={handleDayClick} />
                  </Box>
                ))}
              </Box>
            );
          })}
        </Box>
      </Paper>

      <Paper variant="outlined" sx={{ mt: 2, p: 2, maxHeight: 150, overflowY: 'auto', borderRadius: 2 }}>
        <Typography variant="h6" fontWeight="bold">
          {selectedDate.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
        </Typography>
        <Divider sx={{ my: 1 }} />
        
        {selectedDayEvents.length > 0 ? (
          <Stack spacing={1}>
            {selectedDayEvents.map((event) => (
              <Stack key={event.id} direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body1" fontWeight="medium">{event.title}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {event.start} - {event.end} • {event.location}
                  </Typography>
                </Box>
                <Chip label="Event" size="small" color="primary" variant="outlined" />
              </Stack>
            ))}
          </Stack>
        ) : (
          <Typography variant="body1" color="text.secondary">Nothing scheduled.</Typography>
        )}
      </Paper>

      <Dialog open={isEventModalOpen} onClose={() => setIsEventModalOpen(false)}>
        <DialogTitle>Create New Event</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1, minWidth: 350 }}>
            <TextField label="Title" value={newEvent.title} onChange={(e) => setNewEvent({...newEvent, title: e.target.value})} fullWidth />
            <TextField label="Date" type="date" value={newEvent.date} onChange={(e) => setNewEvent({...newEvent, date: e.target.value})} InputLabelProps={{ shrink: true }} fullWidth />
            <Stack direction="row" spacing={1}>
              <TextField label="Start" type="time" value={newEvent.start} onChange={(e) => setNewEvent({...newEvent, start: e.target.value})} InputLabelProps={{ shrink: true }} fullWidth />
              <TextField label="End" type="time" value={newEvent.end} onChange={(e) => setNewEvent({...newEvent, end: e.target.value})} InputLabelProps={{ shrink: true }} fullWidth />
            </Stack>
            <TextField label="Location" value={newEvent.location} onChange={(e) => setNewEvent({...newEvent, location: e.target.value})} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEventModalOpen(false)}>Cancel</Button>
          <Button onClick={handleAddEvent} variant="contained">Add Event</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const DayCell = ({ day, today, selectedDate, events, onClick }) => {
  const theme = useTheme();
  const isCurrentMonth = day.getMonth() === selectedDate.getMonth();
  const isToday = isSameDay(day, today);
  const isSelected = isSameDay(day, selectedDate);
  const dayEvents = events.filter(e => e.date === formatDateKey(day));

  return (
    <Box 
      onClick={() => onClick(day)}
      sx={{ 
        height: '100%', 
        cursor: 'pointer', 
        p: 0.5,
        bgcolor: isSelected ? theme.palette.primary.main : 'transparent',
        color: isSelected ? 'white' : isCurrentMonth ? 'text.primary' : 'text.disabled',
        '&:hover': { bgcolor: isSelected ? theme.palette.primary.dark : theme.palette.action.hover },
        display: 'flex', 
        flexDirection: 'column',
        position: 'relative'
      }}
    >
      <Typography variant="body2" fontWeight={isToday ? 'bold' : 'normal'}>
        {day.getDate()}
      </Typography>
      
      <Stack direction="row" spacing={0.5} sx={{ mt: 'auto', mb: 0.5, flexWrap: 'wrap', overflow: 'hidden', maxHeight: 20 }}>
        {dayEvents.slice(0, 3).map((e) => (
          <Box key={e.id} sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: isSelected ? 'white' : 'primary.main' }} />
        ))}
        {dayEvents.length > 3 && <Typography variant="caption" sx={{ fontSize: 10 }}>+{dayEvents.length - 3}</Typography>}
      </Stack>
      
      {isToday && (
        <Box sx={{ position: 'absolute', top: 4, right: 4, width: 6, height: 6, borderRadius: '50%', bgcolor: 'secondary.main' }} />
      )}
    </Box>
  );
};

export default Calendar;