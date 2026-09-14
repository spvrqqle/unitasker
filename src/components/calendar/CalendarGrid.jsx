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
  selectedDate,
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

  const isSelected = (year, month, day) => {
    if (!selectedDate) return false;
    return selectedDate.getFullYear() === year &&
           selectedDate.getMonth() === month &&
           selectedDate.getDate() === day;
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

  // Calculate number of weeks to display
  const totalCells = cells.length;
  const numWeeks = Math.ceil(totalCells / 7);

  return (
    <Box sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Navigation Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 1.5,
        flexWrap: 'wrap',
        gap: 1,
        flexShrink: 0,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
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

      {/* Calendar Grid - fills remaining height */}
      <Paper sx={{ 
        flex: 1,
        p: 1.5, 
        bgcolor: 'background.paper', 
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      }}>
        {/* Weekday Headers */}
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 0.5,
          mb: 0.5,
          flexShrink: 0,
        }}>
          {weekDays.map((day) => (
            <Typography
              key={day}
              variant="caption"
              sx={{
                fontWeight: 600,
                textAlign: 'center',
                color: 'text.secondary',
                fontSize: isMobile ? '0.6rem' : '0.7rem',
                py: 0.25,
              }}
            >
              {isMobile ? day.slice(0, 1) : day}
            </Typography>
          ))}
        </Box>

        {/* Calendar Days Grid - fills remaining space */}
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gridTemplateRows: `repeat(${numWeeks}, 1fr)`,
          gap: 0.5,
          flex: 1,
          minHeight: 0,
        }}>
          {cells.map((cell) => {
            if (cell.type === 'empty') {
              return (
                <Box
                  key={cell.key}
                  sx={{
                    borderRadius: 1,
                  }}
                />
              );
            }

            const day = cell.day;
            const dayEvents = getEventsForDay(year, month, day);
            const isTodayDate = isToday(year, month, day);
            const isSelectedDate = isSelected(year, month, day);

            return (
              <Box
                key={cell.key}
                onClick={() => handleDateClick(day)}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  p: 0.5,
                  cursor: 'pointer',
                  borderRadius: 1,
                  bgcolor: isSelectedDate 
                    ? 'primary.main' 
                    : isTodayDate 
                      ? 'action.selected' 
                      : 'transparent',
                  color: isSelectedDate ? 'white' : 'text.primary',
                  border: `1px solid ${
                    isSelectedDate 
                      ? 'transparent' 
                      : isTodayDate 
                        ? 'primary.main' 
                        : theme.palette.divider
                  }`,
                  transition: 'all 0.15s',
                  overflow: 'hidden',
                  '&:hover': {
                    bgcolor: isSelectedDate 
                      ? 'primary.dark' 
                      : 'action.hover',
                  },
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: isSelectedDate || isTodayDate ? 700 : 400,
                    fontSize: isMobile ? '0.7rem' : '0.8rem',
                    lineHeight: 1.2,
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
                          bgcolor: isSelectedDate 
                            ? 'white' 
                            : (event.color || '#0d6efd'),
                        }}
                      />
                    ))}
                    {dayEvents.length > (isMobile ? 2 : 3) && (
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          fontSize: isMobile ? '0.45rem' : '0.55rem',
                          color: isSelectedDate ? 'white' : 'text.secondary',
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
      </Paper>
    </Box>
  );
};

export default CalendarGrid;