import React from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  IconButton,
  Button,
  Stack,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Add as AddIcon,
} from '@mui/icons-material';

const CalendarGrid = ({ 
  currentDate, 
  events, 
  onDateClick, 
  onEventClick, 
  onAddEvent,
  onNavigate 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const formatDate = (year, month, day) => {
    return new Date(year, month, day).toISOString().split('T')[0];
  };

  const isToday = (year, month, day) => {
    const today = new Date();
    return today.getFullYear() === year && 
           today.getMonth() === month && 
           today.getDate() === day;
  };

  const getEventsForDay = (year, month, day) => {
    const dateStr = formatDate(year, month, day);
    return events.filter(event => {
      const eventDate = new Date(event.date);
      const eventDateStr = eventDate.toISOString().split('T')[0];
      return eventDateStr === dateStr;
    });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const handleDateClick = (day) => {
    const date = new Date(year, month, day);
    onDateClick(date);
  };

  const handleNavigate = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    onNavigate(newDate);
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Box>
      {/* Navigation Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2,
        flexWrap: 'wrap',
        gap: 1,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={() => handleNavigate(-1)} size="small">
            <ChevronLeftIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 600, minWidth: 150, textAlign: 'center' }}>
            {monthNames[month]} {year}
          </Typography>
          <IconButton onClick={() => handleNavigate(1)} size="small">
            <ChevronRightIcon />
          </IconButton>
          <Button 
            size="small" 
            variant="outlined" 
            onClick={() => onNavigate(new Date())}
            sx={{ ml: 1 }}
          >
            Today
          </Button>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => onAddEvent(null)}
          size="small"
        >
          New Event
        </Button>
      </Box>

      {/* Calendar Grid */}
      <Paper sx={{ p: 2, bgcolor: 'background.paper', border: `1px solid ${theme.palette.divider}` }}>
        {/* Weekday Headers */}
        <Grid container spacing={0.5} sx={{ mb: 1 }}>
          {weekDays.map((day) => (
            <Grid item xs key={day}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  textAlign: 'center',
                  display: 'block',
                  color: 'text.secondary',
                  fontSize: isMobile ? '0.6rem' : '0.75rem',
                }}
              >
                {isMobile ? day.slice(0, 1) : day}
              </Typography>
            </Grid>
          ))}
        </Grid>

        {/* Calendar Days */}
        <Grid container spacing={0.5}>
          {/* Empty cells for days before the 1st */}
          {Array.from({ length: firstDay }).map((_, index) => (
            <Grid item xs key={`empty-${index}`} sx={{ aspectRatio: '1 / 1' }}>
              <Box sx={{ 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                opacity: 0.3,
              }} />
            </Grid>
          ))}

          {/* Days of the month */}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const dayEvents = getEventsForDay(year, month, day);
            const isTodayDate = isToday(year, month, day);

            return (
              <Grid item xs key={day} sx={{ aspectRatio: '1 / 1' }}>
                <Box
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    p: 0.5,
                    cursor: 'pointer',
                    borderRadius: 2,
                    bgcolor: isTodayDate ? 'primary.main' : 'transparent',
                    color: isTodayDate ? 'white' : 'text.primary',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: isTodayDate ? 'primary.dark' : 'action.hover',
                    },
                  }}
                  onClick={() => handleDateClick(day)}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: isTodayDate ? 700 : 400,
                      fontSize: isMobile ? '0.7rem' : '0.9rem',
                    }}
                  >
                    {day}
                  </Typography>
                  
                  {/* Event dots */}
                  {dayEvents.length > 0 && (
                    <Stack direction="row" spacing={0.3} sx={{ mt: 0.3, flexWrap: 'wrap', justifyContent: 'center' }}>
                      {dayEvents.slice(0, isMobile ? 2 : 4).map((event, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            width: isMobile ? 4 : 6,
                            height: isMobile ? 4 : 6,
                            borderRadius: '50%',
                            bgcolor: event.color || '#0d6efd',
                          }}
                        />
                      ))}
                      {dayEvents.length > (isMobile ? 2 : 4) && (
                        <Typography variant="caption" sx={{ fontSize: isMobile ? '0.4rem' : '0.5rem' }}>
                          +{dayEvents.length - (isMobile ? 2 : 4)}
                        </Typography>
                      )}
                    </Stack>
                  )}
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Paper>
    </Box>
  );
};

export default CalendarGrid;