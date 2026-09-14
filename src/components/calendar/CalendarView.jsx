import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Event as EventIcon,
} from '@mui/icons-material';
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
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'day', 'week', 'month'
  const [formOpen, setFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formDate, setFormDate] = useState(null);

  // ---------- Helpers ----------
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const weekDaysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const formatDateKey = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const isSameDay = (a, b) => formatDateKey(a) === formatDateKey(b);

  const isToday = (date) => isSameDay(date, new Date());

  const getEventsForDay = (date) => {
    const key = formatDateKey(date);
    return events.filter(event => formatDateKey(new Date(event.date)) === key);
  };

  const getStartOfWeek = (date) => {
    const d = new Date(date);
    d.setDate(d.getDate() - d.getDay());
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  // ---------- Navigation ----------
  const handleNavigate = (direction) => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + direction);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction * 7));
    } else {
      newDate.setDate(newDate.getDate() + direction);
    }
    setCurrentDate(newDate);
    setSelectedDate(newDate);
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const handleViewChange = (mode) => {
    setViewMode(mode);
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    if (viewMode === 'month') {
      setCurrentDate(date);
    }
  };

  // ---------- Header Title ----------
  const getHeaderTitle = () => {
    if (viewMode === 'month') {
      return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    }
    if (viewMode === 'week') {
      const start = getStartOfWeek(currentDate);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      const startMonth = monthNames[start.getMonth()].slice(0, 3);
      const endMonth = monthNames[end.getMonth()].slice(0, 3);
      if (start.getMonth() === end.getMonth()) {
        return `${startMonth} ${start.getDate()} – ${end.getDate()}, ${start.getFullYear()}`;
      }
      return `${startMonth} ${start.getDate()} – ${endMonth} ${end.getDate()}, ${start.getFullYear()}`;
    }
    return `${dayNames[currentDate.getDay()]}, ${monthNames[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`;
  };

  // ---------- Event CRUD ----------
  const handleAddEvent = (date) => {
    setFormDate(date || selectedDate);
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

  // ---------- Month View ----------
  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const numWeeks = Math.ceil((firstDay + daysInMonth) / 7);

    const cells = [];
    for (let i = 0; i < firstDay; i++) {
      cells.push({ type: 'empty', key: `empty-${i}` });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      cells.push({ type: 'day', day, key: `day-${day}` });
    }

    return (
      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: 0.5,
        flex: 1,
        minHeight: 0,
      }}>
        {/* Weekday headers */}
        {weekDaysShort.map((day) => (
          <Typography
            key={day}
            variant="caption"
            sx={{
              fontWeight: 600,
              textAlign: 'center',
              color: 'text.secondary',
              fontSize: isMobile ? '0.6rem' : '0.7rem',
              py: 0.5,
            }}
          >
            {isMobile ? day.slice(0, 1) : day}
          </Typography>
        ))}

        {/* Day cells */}
        {cells.map((cell) => {
          if (cell.type === 'empty') {
            return <Box key={cell.key} />;
          }

          const day = cell.day;
          const cellDate = new Date(year, month, day);
          const dayEvents = getEventsForDay(cellDate);
          const cellIsToday = isToday(cellDate);
          const cellIsSelected = isSameDay(cellDate, selectedDate);

          return (
            <Box
              key={cell.key}
              onClick={() => handleDateClick(cellDate)}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                p: 0.5,
                cursor: 'pointer',
                borderRadius: 1,
                bgcolor: cellIsSelected 
                  ? 'primary.main' 
                  : cellIsToday 
                    ? 'action.selected' 
                    : 'transparent',
                color: cellIsSelected ? 'white' : 'text.primary',
                border: `1px solid ${
                  cellIsSelected 
                    ? 'transparent' 
                    : cellIsToday 
                      ? 'primary.main' 
                      : theme.palette.divider
                }`,
                transition: 'all 0.15s',
                overflow: 'hidden',
                '&:hover': {
                  bgcolor: cellIsSelected ? 'primary.dark' : 'action.hover',
                },
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontWeight: cellIsSelected || cellIsToday ? 700 : 400,
                  fontSize: isMobile ? '0.7rem' : '0.8rem',
                  lineHeight: 1.2,
                }}
              >
                {day}
              </Typography>
              
              {dayEvents.length > 0 && (
                <Box sx={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: 0.3, 
                  mt: 0.3, 
                  justifyContent: 'center' 
                }}>
                  {dayEvents.slice(0, isMobile ? 2 : 3).map((event, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        width: isMobile ? 3 : 5,
                        height: isMobile ? 3 : 5,
                        borderRadius: '50%',
                        bgcolor: cellIsSelected ? 'white' : (event.color || '#0d6efd'),
                      }}
                    />
                  ))}
                  {dayEvents.length > (isMobile ? 2 : 3) && (
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontSize: isMobile ? '0.45rem' : '0.55rem',
                        color: cellIsSelected ? 'white' : 'text.secondary',
                        lineHeight: 1,
                      }}
                    >
                      +{dayEvents.length - (isMobile ? 2 : 3)}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    );
  };

  // ---------- Week View ----------
  const renderWeekView = () => {
    const startOfWeek = getStartOfWeek(currentDate);
    const weekDates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      return d;
    });

    return (
      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: 0.5,
        flex: 1,
        minHeight: 0,
      }}>
        {/* Weekday headers */}
        {weekDates.map((date, index) => (
          <Typography
            key={index}
            variant="caption"
            sx={{
              fontWeight: 600,
              textAlign: 'center',
              color: 'text.secondary',
              fontSize: isMobile ? '0.6rem' : '0.7rem',
              py: 0.5,
            }}
          >
            {isMobile ? weekDaysShort[index].slice(0, 1) : weekDaysShort[index]}
          </Typography>
        ))}

        {/* Day columns with events */}
        {weekDates.map((date, index) => {
          const dayEvents = getEventsForDay(date);
          const cellIsToday = isToday(date);
          const cellIsSelected = isSameDay(date, selectedDate);

          return (
            <Box
              key={index}
              onClick={() => handleDateClick(date)}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                p: 0.5,
                cursor: 'pointer',
                borderRadius: 1,
                bgcolor: cellIsSelected 
                  ? 'primary.main' 
                  : cellIsToday 
                    ? 'action.selected' 
                    : 'transparent',
                color: cellIsSelected ? 'white' : 'text.primary',
                border: `1px solid ${
                  cellIsSelected 
                    ? 'transparent' 
                    : cellIsToday 
                      ? 'primary.main' 
                      : theme.palette.divider
                }`,
                transition: 'all 0.15s',
                overflow: 'auto',
                '&:hover': {
                  bgcolor: cellIsSelected ? 'primary.dark' : 'action.hover',
                },
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontWeight: cellIsSelected || cellIsToday ? 700 : 400,
                  fontSize: isMobile ? '0.75rem' : '0.9rem',
                  lineHeight: 1.2,
                  mb: 0.5,
                }}
              >
                {date.getDate()}
              </Typography>

              {/* Events in column */}
              <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                {dayEvents.map((event) => (
                  <Box
                    key={event.id}
                    onClick={(e) => { e.stopPropagation(); handleEditEvent(event); }}
                    sx={{
                      bgcolor: cellIsSelected 
                        ? 'rgba(255,255,255,0.25)' 
                        : (event.color || '#0d6efd'),
                      color: 'white',
                      fontSize: '0.6rem',
                      p: 0.3,
                      borderRadius: 0.5,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      cursor: 'pointer',
                      '&:hover': { opacity: 0.85 },
                    }}
                  >
                    {event.title}
                  </Box>
                ))}
              </Box>
            </Box>
          );
        })}
      </Box>
    );
  };

  // ---------- Day View ----------
  const renderDayView = () => {
    const dayEvents = getEventsForDay(selectedDate);

    return (
      <Box sx={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        overflow: 'hidden',
      }}>
        {/* Day summary */}
        <Box sx={{ mb: 1.5, flexShrink: 0 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {dayNames[selectedDate.getDay()]}, {monthNames[selectedDate.getMonth()]} {selectedDate.getDate()}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {dayEvents.length === 0 
              ? 'Nothing scheduled.' 
              : `${dayEvents.length} ${dayEvents.length === 1 ? 'event' : 'events'}`}
          </Typography>
        </Box>

        {/* Events list */}
        {dayEvents.length === 0 ? (
          <Box sx={{ 
            flex: 1,
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center',
            gap: 1,
            border: `1px dashed ${theme.palette.divider}`,
            borderRadius: 2,
          }}>
            <EventIcon sx={{ fontSize: 36, color: 'text.disabled' }} />
            <Typography color="text.secondary" variant="body2">
              Nothing scheduled for this day
            </Typography>
          </Box>
        ) : (
          <List 
            dense 
            sx={{ 
              py: 0,
              flex: 1,
              overflow: 'auto',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              '&::-webkit-scrollbar': { width: '4px' },
              '&::-webkit-scrollbar-thumb': { 
                background: theme.palette.divider, 
                borderRadius: '2px' 
              },
            }}
          >
            {dayEvents.map((event, index) => (
              <React.Fragment key={event.id}>
                {index > 0 && <Divider sx={{ opacity: 0.5 }} />}
                <ListItem
                  sx={{
                    py: 1,
                    px: 2,
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        bgcolor: event.color || '#0d6efd',
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
                        {event.title}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        {event.description && (
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                            {event.description}
                          </Typography>
                        )}
                        {event.time && (
                          <Typography 
                            variant="caption" 
                            color="text.secondary" 
                            sx={{ display: 'block', mt: 0.2, fontSize: '0.7rem' }}
                          >
                            🕐 {formatTime(event.date)}
                          </Typography>
                        )}
                      </Box>
                    }
                    secondaryTypographyProps={{ component: 'div' }}
                  />
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton 
                      size="small" 
                      onClick={() => handleEditEvent(event)}
                      sx={{ color: 'text.secondary', p: 0.5 }}
                    >
                      <EditIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleDeleteEvent(event.id)}
                      sx={{ color: 'text.secondary', p: 0.5 }}
                    >
                      <DeleteIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>
    );
  };

  // ---------- Render ----------
  return (
    <Box sx={{ 
      height: 'calc(100vh - 140px)',
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      overflow: 'hidden',
    }}>
      {/* Navigation Header with Title and Tabs */}
      <Box sx={{ flexShrink: 0 }}>
        {/* Top row: navigation + Add Event */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 1,
          flexWrap: 'wrap',
          gap: 1,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <IconButton onClick={() => handleNavigate(-1)} size="small">
              <ChevronLeftIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 600, minWidth: 170, textAlign: 'center' }}>
              {getHeaderTitle()}
            </Typography>
            <IconButton onClick={() => handleNavigate(1)} size="small">
              <ChevronRightIcon />
            </IconButton>
            <Button 
              size="small" 
              variant="outlined" 
              onClick={handleToday}
              sx={{ ml: 1 }}
            >
              Today
            </Button>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleAddEvent(null)}
            size="small"
          >
            New Event
          </Button>
        </Box>

        {/* View toggle tabs */}
        <Box sx={{ 
          display: 'flex', 
          gap: 0.5,
          mb: 1.5,
        }}>
          {['day', 'week', 'month'].map((mode) => (
            <Button
              key={mode}
              size="small"
              variant={viewMode === mode ? 'contained' : 'outlined'}
              onClick={() => handleViewChange(mode)}
              sx={{ 
                textTransform: 'capitalize',
                fontSize: '0.75rem',
                minWidth: 70,
                py: 0.4,
              }}
            >
              {mode}
            </Button>
          ))}
        </Box>
      </Box>

      {/* Calendar Content */}
      <Paper sx={{ 
        flex: 1,
        p: 1.5, 
        bgcolor: 'background.paper', 
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        overflow: 'hidden',
      }}>
        {viewMode === 'month' && renderMonthView()}
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'day' && renderDayView()}
      </Paper>

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