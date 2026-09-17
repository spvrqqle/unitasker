import React from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  IconButton,
  Button,
  Divider,
  Tooltip,
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
  onAddEvent,
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
      minute: '2-digit',
    });
  };

  if (!selectedDate) return null;

  return (
    <Paper
      sx={{
        p: 1.5,
        bgcolor: 'background.paper',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1,
          flexShrink: 0,
        }}
      >
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
          aria-label="Add event to this day"
          sx={{ fontSize: '0.7rem', py: 0.5 }}
        >
          Add Event
        </Button>
      </Box>

      {/* Events */}
      {events.length === 0 ? (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            border: `1px dashed ${theme.palette.divider}`,
            borderRadius: 1.5,
            minHeight: 0,
          }}
        >
          <EventIcon sx={{ fontSize: 20, color: 'text.disabled' }} />
          <Typography color="text.secondary" variant="body2" sx={{ fontSize: '0.8rem' }}>
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
            '&::-webkit-scrollbar': { width: '4px' },
            '&::-webkit-scrollbar-thumb': {
              background: theme.palette.divider,
              borderRadius: '2px',
            },
          }}
        >
          {events.map((event, index) => (
            <React.Fragment key={event.id}>
              {index > 0 && <Divider sx={{ opacity: 0.5 }} />}
              <ListItem
                disablePadding
                secondaryAction={
                  <Box sx={{ display: 'flex', gap: 0.25 }}>
                    <Tooltip title="Edit event" arrow>
                      <IconButton
                        size="small"
                        onClick={() => onEventClick(event)}
                        aria-label={`Edit ${event.title}`}
                        sx={{ p: 0.5 }}
                      >
                        <EditIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete event" arrow>
                      <IconButton
                        size="small"
                        onClick={() => onEventDelete(event.id)}
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
                  onClick={() => onEventClick(event)}
                  sx={{
                    py: 0.75,
                    pr: 8,
                    borderRadius: 1,
                    '&:focus-visible': {
                      outline: `2px solid ${theme.palette.primary.main}`,
                      outlineOffset: -2,
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
                      <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8rem' }} noWrap>
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
                            sx={{ fontSize: '0.65rem' }}
                            noWrap
                          >
                            {event.description}
                          </Typography>
                        )}
                        {event.time && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            component="div"
                            sx={{ display: 'block', mt: 0.2, fontSize: '0.65rem' }}
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
    </Paper>
  );
};

export default EventList;