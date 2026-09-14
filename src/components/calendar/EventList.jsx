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
  useTheme,
} from '@mui/material';
import {
  Event as EventIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
} from '@mui/icons-material';

const EventList = ({ 
  events, 
  selectedDate, 
  onEventClick, 
  onEventDelete, 
  onAddEvent 
}) => {
  const theme = useTheme();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
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
    return null;
  }

  return (
    <Paper sx={{ 
      p: 1.5, 
      bgcolor: 'background.paper', 
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: 2,
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 1,
        flexShrink: 0,
      }}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
            {formatDate(selectedDate)}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
            {events.length === 0 
              ? 'Nothing scheduled.' 
              : `${events.length} ${events.length === 1 ? 'event' : 'events'}`}
          </Typography>
        </Box>
        <Button
          size="small"
          variant="contained"
          startIcon={<AddIcon sx={{ fontSize: 16 }} />}
          onClick={() => onAddEvent(selectedDate)}
          sx={{ fontSize: '0.7rem', py: 0.5 }}
        >
          Add Event
        </Button>
      </Box>

      {/* Event List */}
      {events.length === 0 ? (
        <Box sx={{ 
          flex: 1,
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: 1,
        }}>
          <EventIcon sx={{ fontSize: 20, color: 'text.disabled' }} />
          <Typography color="text.secondary" variant="body2" sx={{ fontSize: '0.8rem' }}>
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
            '&::-webkit-scrollbar': { width: '4px' },
            '&::-webkit-scrollbar-thumb': { 
              background: theme.palette.divider, 
              borderRadius: '2px' 
            },
          }}
        >
          {events.map((event, index) => (
            <React.Fragment key={event.id}>
              {index > 0 && <Divider sx={{ opacity: 0.5 }} />}
              <ListItem
                sx={{
                  py: 0.75,
                  px: 1,
                  borderRadius: 1,
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
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
                    <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8rem' }}>
                      {event.title}
                    </Typography>
                  }
                  secondary={
                    <Box>
                      {event.description && (
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                          {event.description}
                        </Typography>
                      )}
                      {event.time && (
                        <Typography 
                          variant="caption" 
                          color="text.secondary" 
                          sx={{ display: 'block', mt: 0.2, fontSize: '0.65rem' }}
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
                    onClick={() => onEventClick(event)}
                    sx={{ color: 'text.secondary', p: 0.5 }}
                  >
                    <EditIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={() => onEventDelete(event.id)}
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
    </Paper>
  );
};

export default EventList;