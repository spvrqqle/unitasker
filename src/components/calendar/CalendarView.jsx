import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
  Tooltip,
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
  Close as CloseIcon,
} from '@mui/icons-material';
import EventForm from './EventForm';
import { useEvents } from '../../hooks/useEvents';

const CalendarView = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const {
    events,
    addEvent,
    editEvent,
    removeEvent,
    refreshEvents,
  } = useEvents();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month');
  const [formOpen, setFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formDate, setFormDate] = useState(null);

  // Popup
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupDate, setPopupDate] = useState(null);
  const [popupEvents, setPopupEvents] = useState([]);

  // Delete confirmation
  const [deleteDialog, setDeleteDialog] = useState({ open: false, event: null });

  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

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
    return events
      .filter(e => formatDateKey(new Date(e.date)) === key)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
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

  const formatPopupDate = (date) => {
    return `${dayNames[date.getDay()]}, ${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  // ---------- Navigation ----------
  const handleNavigate = (direction) => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') newDate.setMonth(newDate.getMonth() + direction);
    else if (viewMode === 'week') newDate.setDate(newDate.getDate() + direction * 7);
    else newDate.setDate(newDate.getDate() + direction);
    setCurrentDate(newDate);
    setSelectedDate(newDate);
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const handleViewChange = (mode) => setViewMode(mode);

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setCurrentDate(date);
    const dayEvents = getEventsForDay(date);
    if (dayEvents.length > 0) {
      setPopupDate(date);
      setPopupEvents(dayEvents);
      setPopupOpen(true);
    }
  };

  const handleClosePopup = () => {
    setPopupOpen(false);
    setPopupDate(null);
    setPopupEvents([]);
  };

  const handleGoToDayView = () => {
    if (popupDate) {
      setSelectedDate(popupDate);
      setCurrentDate(popupDate);
      setViewMode('day');
    }
    handleClosePopup();
  };

  // ---------- Header title ----------
  const getHeaderTitle = () => {
    if (viewMode === 'month') return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    if (viewMode === 'week') {
      const start = getStartOfWeek(currentDate);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      const sm = monthNames[start.getMonth()].slice(0, 3);
      const em = monthNames[end.getMonth()].slice(0, 3);
      if (start.getMonth() === end.getMonth()) {
        return `${sm} ${start.getDate()} – ${end.getDate()}, ${start.getFullYear()}`;
      }
      return `${sm} ${start.getDate()} – ${em} ${end.getDate()}, ${start.getFullYear()}`;
    }
    return `${dayNames[currentDate.getDay()]}, ${monthNames[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`;
  };

  // ---------- CRUD ----------
  const handleAddEvent = (date) => {
    setEditingEvent(null);
    setFormDate(date || selectedDate || new Date());
    setFormOpen(true);
    if (popupOpen) handleClosePopup();
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setFormDate(null);
    setFormOpen(true);
    if (popupOpen) handleClosePopup();
  };

  const handleDeleteClick = (id) => {
    const event = events.find(e => e.id === id);
    setDeleteDialog({ open: true, event });
  };

  const handleDeleteConfirm = async () => {
    try {
      await removeEvent(deleteDialog.event.id);
      await refreshEvents();
      showSnackbar('Event deleted', 'success');

      if (popupDate) {
        const updated = popupEvents.filter(e => e.id !== deleteDialog.event.id);
        setPopupEvents(updated);
        if (updated.length === 0) handleClosePopup();
      }
    } catch (err) {
      showSnackbar('Failed to delete event', 'error');
    } finally {
      setDeleteDialog({ open: false, event: null });
    }
  };

  const handleSaveEvent = async (eventData) => {
    try {
      if (editingEvent) {
        await editEvent(editingEvent.id, eventData);
        showSnackbar('Event updated', 'success');
      } else {
        await addEvent(eventData);
        showSnackbar('Event created', 'success');
      }
      setFormOpen(false);
      setEditingEvent(null);
      setFormDate(null);
      refreshEvents();
    } catch (err) {
      showSnackbar('Failed to save event', 'error');
    }
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingEvent(null);
    setFormDate(null);
  };

  // ---------- Month view ----------
  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const numWeeks = Math.ceil((firstDay + daysInMonth) / 7);

    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push({ type: 'empty', key: `empty-${i}` });
    for (let day = 1; day <= daysInMonth; day++) cells.push({ type: 'day', day, key: `day-${day}` });

    return (
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gridTemplateRows: 'auto 1fr',
        gap: 0.5,
        flex: 1,
        minHeight: 0,
      }}>
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

        <Box sx={{
          gridColumn: '1 / -1',
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gridTemplateRows: `repeat(${numWeeks}, 1fr)`,
          gap: 0.5,
          minHeight: 0,
        }}>
          {cells.map((cell) => {
            if (cell.type === 'empty') return <Box key={cell.key} />;

            const day = cell.day;
            const cellDate = new Date(year, month, day);
            const dayEvents = getEventsForDay(cellDate);
            const cellIsToday = isToday(cellDate);
            const cellIsSelected = isSameDay(cellDate, selectedDate);

            return (
              <Box
                key={cell.key}
                onClick={() => handleDateClick(cellDate)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleDateClick(cellDate);
                  }
                }}
                aria-label={`${day} ${monthNames[month]}, ${dayEvents.length} events`}
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
                  border: `1px solid ${cellIsSelected
                    ? 'transparent'
                    : cellIsToday
                      ? 'primary.main'
                      : theme.palette.divider}`,
                  transition: 'background-color 0.15s ease, border-color 0.15s ease',
                  overflow: 'hidden',
                  '&:hover': {
                    bgcolor: cellIsSelected ? 'primary.dark' : 'action.hover',
                  },
                  '&:focus-visible': {
                    outline: `2px solid ${theme.palette.primary.main}`,
                    outlineOffset: 2,
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
                    justifyContent: 'center',
                    width: '100%',
                  }}>
                    {dayEvents.slice(0, isMobile ? 2 : 3).map((event, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          width: isMobile ? 4 : 6,
                          height: isMobile ? 4 : 6,
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
      </Box>
    );
  };

  // ---------- Week view ----------
  const renderWeekView = () => {
    const startOfWeek = getStartOfWeek(currentDate);
    const weekDates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      return d;
    });

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 0.5,
          mb: 0.5,
          flexShrink: 0,
        }}>
          {weekDates.map((date, index) => {
            const cellIsToday = isToday(date);
            const cellIsSelected = isSameDay(date, selectedDate);

            return (
              <Box
                key={index}
                onClick={() => handleDateClick(date)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleDateClick(date);
                  }
                }}
                aria-label={`${dayNames[index]} ${date.getDate()}`}
                sx={{
                  textAlign: 'center',
                  py: 0.75,
                  px: 0.5,
                  cursor: 'pointer',
                  borderRadius: 1,
                  bgcolor: cellIsSelected ? 'primary.main' : 'transparent',
                  color: cellIsSelected ? 'white' : 'text.primary',
                  transition: 'background-color 0.15s ease',
                  '&:hover': {
                    bgcolor: cellIsSelected ? 'primary.dark' : 'action.hover',
                  },
                  '&:focus-visible': {
                    outline: `2px solid ${theme.palette.primary.main}`,
                    outlineOffset: 2,
                  },
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    fontWeight: 600,
                    color: cellIsSelected ? 'white' : 'text.secondary',
                    fontSize: '0.7rem',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  {isMobile ? weekDaysShort[index].slice(0, 1) : weekDaysShort[index]}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: cellIsSelected || cellIsToday ? 700 : 500,
                    fontSize: '1rem',
                    lineHeight: 1.2,
                    mt: 0.25,
                    color: cellIsSelected ? 'white' : cellIsToday ? 'primary.main' : 'text.primary',
                  }}
                >
                  {date.getDate()}
                </Typography>
              </Box>
            );
          })}
        </Box>

        <Box sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 0.5,
          flex: 1,
          minHeight: 0,
        }}>
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
                  gap: 0.5,
                  p: 0.5,
                  cursor: 'pointer',
                  borderRadius: 1,
                  bgcolor: cellIsSelected
                    ? 'action.selected'
                    : cellIsToday
                      ? 'action.hover'
                      : 'transparent',
                  border: `1px solid ${cellIsSelected ? 'primary.main' : theme.palette.divider}`,
                  overflow: 'auto',
                  '&:hover': { bgcolor: 'action.hover' },
                  '&::-webkit-scrollbar': { width: '4px' },
                  '&::-webkit-scrollbar-thumb': {
                    background: theme.palette.divider,
                    borderRadius: '2px',
                  },
                }}
              >
                {dayEvents.length === 0 ? (
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.disabled',
                      fontSize: '0.65rem',
                      textAlign: 'center',
                      mt: 1,
                    }}
                  >
                    —
                  </Typography>
                ) : (
                  dayEvents.map((event) => (
                    <Box
                      key={event.id}
                      sx={{
                        bgcolor: event.color || '#0d6efd',
                        color: 'white',
                        px: 0.75,
                        py: 0.5,
                        borderRadius: 0.75,
                        pointerEvents: 'none',
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{ display: 'block', fontSize: '0.6rem', opacity: 0.85, lineHeight: 1, mb: 0.2 }}
                      >
                        {event.time ? formatTime(event.date) : 'All day'}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          lineHeight: 1.2,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {event.title}
                      </Typography>
                    </Box>
                  ))
                )}
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  };

  // ---------- Day view ----------
  const renderDayView = () => {
    const dayEvents = getEventsForDay(selectedDate);

    return (
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
        <Box sx={{
          mb: 1.5,
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {dayNames[selectedDate.getDay()]}, {monthNames[selectedDate.getMonth()]} {selectedDate.getDate()}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {dayEvents.length === 0
                ? 'Nothing scheduled.'
                : `${dayEvents.length} ${dayEvents.length === 1 ? 'event' : 'events'}`}
            </Typography>
          </Box>
          <Button
            size="small"
            variant="contained"
            startIcon={<AddIcon sx={{ fontSize: 16 }} />}
            onClick={() => handleAddEvent(selectedDate)}
            aria-label="Add event to this day"
            sx={{ fontSize: '0.7rem', py: 0.5 }}
          >
            Add Event
          </Button>
        </Box>

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
            disablePadding
            sx={{
              py: 0,
              flex: 1,
              minHeight: 0,
              overflow: 'auto',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              '&::-webkit-scrollbar': { width: '4px' },
              '&::-webkit-scrollbar-thumb': {
                background: theme.palette.divider,
                borderRadius: '2px',
              },
            }}
          >
            {dayEvents.map((event, index) => (
              <React.Fragment key={event.id}>
                {index > 0 && <Divider sx={{ opacity: 0.5 }} />}
                <ListItem
                  disablePadding
                  secondaryAction={
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Edit event" arrow>
                        <IconButton
                          size="small"
                          onClick={() => handleEditEvent(event)}
                          aria-label={`Edit ${event.title}`}
                          sx={{ p: 0.5 }}
                        >
                          <EditIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete event" arrow>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(event.id)}
                          aria-label={`Delete ${event.title}`}
                          color="error"
                          sx={{ p: 0.5 }}
                        >
                          <DeleteIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                >
                  <ListItemButton
                    onClick={() => handleEditEvent(event)}
                    sx={{ py: 1, pr: 10 }}
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
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              component="div"
                              sx={{ fontSize: '0.7rem' }}
                            >
                              {event.description}
                            </Typography>
                          )}
                          {event.time && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              component="div"
                              sx={{ display: 'block', mt: 0.2, fontSize: '0.7rem' }}
                            >
                              🕐 {formatTime(event.date)}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItemButton>
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
      {/* Header */}
      <Box sx={{ flexShrink: 0 }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1,
          flexWrap: 'wrap',
          gap: 1,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Tooltip title="Previous" arrow>
              <IconButton onClick={() => handleNavigate(-1)} size="small" aria-label="Previous">
                <ChevronLeftIcon />
              </IconButton>
            </Tooltip>
            <Typography variant="h6" sx={{ fontWeight: 600, minWidth: 170, textAlign: 'center' }}>
              {getHeaderTitle()}
            </Typography>
            <Tooltip title="Next" arrow>
              <IconButton onClick={() => handleNavigate(1)} size="small" aria-label="Next">
                <ChevronRightIcon />
              </IconButton>
            </Tooltip>
            <Button size="small" variant="outlined" onClick={handleToday} sx={{ ml: 1 }}>
              Today
            </Button>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleAddEvent(null)}
            size="small"
            aria-label="Create new event"
          >
            New Event
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 0.5, mb: 1.5 }}>
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

      {/* Content */}
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

      {/* Day events popup */}
      <Dialog
        open={popupOpen}
        onClose={handleClosePopup}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1,
        }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {popupDate ? formatPopupDate(popupDate) : ''}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {popupEvents.length} {popupEvents.length === 1 ? 'event' : 'events'}
            </Typography>
          </Box>
          <IconButton onClick={handleClosePopup} size="small" aria-label="Close popup">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 0 }}>
          <List dense disablePadding>
            {popupEvents.map((event, index) => (
              <React.Fragment key={event.id}>
                {index > 0 && <Divider sx={{ opacity: 0.5 }} />}
                <ListItem
                  disablePadding
                  secondaryAction={
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Edit event" arrow>
                        <IconButton
                          size="small"
                          onClick={() => handleEditEvent(event)}
                          aria-label={`Edit ${event.title}`}
                          sx={{ p: 0.5 }}
                        >
                          <EditIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete event" arrow>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(event.id)}
                          aria-label={`Delete ${event.title}`}
                          color="error"
                          sx={{ p: 0.5 }}
                        >
                          <DeleteIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                >
                  <ListItemButton onClick={() => handleEditEvent(event)} sx={{ py: 1, pr: 10 }}>
                    <ListItemIcon sx={{ minWidth: 24 }}>
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
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              component="div"
                              sx={{ fontSize: '0.7rem' }}
                            >
                              {event.description}
                            </Typography>
                          )}
                          {event.time && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              component="div"
                              sx={{ display: 'block', mt: 0.2, fontSize: '0.7rem' }}
                            >
                              🕐 {formatTime(event.date)}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </DialogContent>

        <DialogActions sx={{ p: 1.5, justifyContent: 'space-between' }}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => handleAddEvent(popupDate)}
            startIcon={<AddIcon sx={{ fontSize: 16 }} />}
            sx={{ fontSize: '0.75rem' }}
          >
            Add Event
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={handleGoToDayView}
            sx={{ fontSize: '0.75rem' }}
          >
            View Day →
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, event: null })}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Event?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete <strong>{deleteDialog.event?.title}</strong>?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setDeleteDialog({ open: false, event: null })} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Event form */}
      <EventForm
        open={formOpen}
        onClose={handleCloseForm}
        onSave={handleSaveEvent}
        event={editingEvent}
        selectedDate={formDate}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2500}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CalendarView;