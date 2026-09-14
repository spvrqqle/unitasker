import React from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Button,
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
    const date = new Date(year, month, day);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
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
      const yyyy = eventDate.getFullYear();
      const mm = String(eventDate.getMonth() + 1).padStart(2, '0');
      const dd = String(eventDate.getDate()).padStart(2, '0');
      const eventDateStr = `${yyyy}-${mm}-${dd}`;
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

  // Build the array of cells (empty cells + days)
  const cells = [];
  
  for (let i = 0; i < firstDay; i++) {
    cells.push({ type: 'empty', key: `empty-${i}` });
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ type: 'day', day, key: `day-${day}` });
  }

  return (
    <Box sx={{ width: '100%' }}>
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
          <Typography variant="h6" sx={{ fontWeight: 600, minWidth: 170, textAlign: 'center' }}>
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

      {/* Calendar Grid - stretches full width */}
      <Paper sx={{ 
        p: 2, 
        bgcolor: 'background.paper', 
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        width: '100%',
      }}>
        {/* Weekday Headers */}
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 0.5,
          mb: 1,
        }}>
          {weekDays.map((day) => (
            <Typography
              key={day}
              variant="caption"
              sx={{
                fontWeight: 600,
                textAlign: 'center',
                color: 'text.secondary',
                fontSize: isMobile ? '0.6rem' : '0.75rem',
                py: 0.5,
              }}
            >
              {isMobile ? day.slice(0, 1) : day}
            </Typography>
          ))}
        </Box>

        {/* Calendar Days Grid */}
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 0.5,
        }}>
          {cells.map((cell) => {
            if (cell.type === 'empty') {
              return (
                <Box
                  key={cell.key}
                  sx={{
                    aspectRatio: '1 / 1',
                    borderRadius: 1,
                  }}
                />
              );
            }

            const day = cell.day;
            const dayEvents = getEventsForDay(year, month, day);
            const isTodayDate = isToday(year, month, day);

            return (
              <Box
                key={cell.key}
                onClick={() => handleDateClick(day)}
                sx={{
                  aspectRatio: '1 / 1',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  p: 0.5,
                  cursor: 'pointer',
                  borderRadius: 1,
                  bgcolor: isTodayDate ? 'primary.main' : 'transparent',
                  color: isTodayDate ? 'white' : 'text.primary',
                  border: `1px solid ${isTodayDate ? 'transparent' : theme.palette.divider}`,
                  transition: 'all 0.15s',
                  '&:hover': {
                    bgcolor: isTodayDate ? 'primary.dark' : 'action.hover',
                  },
                }}
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
                  <Box sx={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: 0.3, 
                    mt: 0.5, 
                    justifyContent: 'center' 
                  }}>
                    {dayEvents.slice(0, isMobile ? 2 : 4).map((event, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          width: isMobile ? 4 : 6,
                          height: isMobile ? 4 : 6,
                          borderRadius: '50%',
                          bgcolor: event.color || '#0d6efd',
                          border: isTodayDate ? '1px solid white' : 'none',
                        }}
                      />
                    ))}
                    {dayEvents.length > (isMobile ? 2 : 4) && (
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          fontSize: isMobile ? '0.5rem' : '0.6rem',
                          color: isTodayDate ? 'white' : 'text.secondary',
                          lineHeight: 1,
                        }}
                      >
                        +{dayEvents.length - (isMobile ? 2 : 4)}
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      </Paper>
    </Box>
  );
};

export default CalendarGrid;