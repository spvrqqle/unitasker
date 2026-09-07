import React from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Button,
  Divider,
  Chip,
  useTheme,
} from '@mui/material';
import {
  Event as EventIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

const EventList = ({ 
  events, 
  selectedDate, 
  onEventClick, 
  onEventDelete, 
  onClose,
  onAddEvent 
}) => {
  const theme = useTheme();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!selectedDate) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'background.paper', border: `1px solid ${theme.palette.divider}` }}>
        <Typography color="text.secondary">
          Select a date to view events
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ 
      p: 2, 
      bgcolor: 'background.paper', 
      border: `1px solid ${theme.palette.divider}`,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2,
      }}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {formatDate(selectedDate)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {events.length} {events.length === 1 ? 'event' : 'events'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            variant="contained"
            startIcon={<EventIcon />}
            onClick={() => onAddEvent(selectedDate)}
          >
            Add
          </Button>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Event List */}
      {events.length === 0 ? (
        <Box sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          py: 4,
        }}>
          <EventIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
          <Typography color="text.secondary" gutterBottom>
            No events for this day
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={() => onAddEvent(selectedDate)}
            sx={{ mt: 1 }}
          >
            Add Event
          </Button>
        </Box>
      ) : (
        <List dense sx={{ 
          flex: 1, 
          overflow: 'auto',
          '&::-webkit-scrollbar': { width: '4px' },
          '&::-webkit-scrollbar-thumb': { background: theme.palette.divider, borderRadius: '2px' },
        }}>
          {events.map((event, index) => (
            <React.Fragment key={event.id}>
              {index > 0 && <Divider />}
              <ListItem
                sx={{
                  py: 1.5,
                  px: 1,
                  borderRadius: 1,
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: event.color || '#0d6efd',
                    }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {event.title}
                    </Typography>
                  }
                  secondary={
                    <Box>
                      {event.description && (
                        <Typography variant="caption" color="text.secondary">
                          {event.description}
                        </Typography>
                      )}
                      {event.time && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.3 }}>
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
                    onClick={() => onEventClick(event)}
                    sx={{ color: 'text.secondary' }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={() => onEventDelete(event.id)}
                    sx={{ color: 'text.secondary' }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default EventList;