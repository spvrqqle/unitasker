import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  Badge,
  Chip,
  Button,
  useTheme,
} from '@mui/material';
import {
  Close as CloseIcon,
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  Alarm as AlarmIcon,
  Info as InfoIcon,
  ClearAll as ClearAllIcon,
} from '@mui/icons-material';

const STORAGE_KEY = 'unitaser_notifications';

const NotificationDrawer = ({ open, onClose, onUnreadCountChange }) => {
  const theme = useTheme();

  const [notifications, setNotifications] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load notifications from localStorage on mount
  useEffect(() => {
    const savedNotifications = localStorage.getItem(STORAGE_KEY);

    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications);
        if (Array.isArray(parsed)) {
          setNotifications(parsed);
          setIsInitialized(true);
          return;
        }
      } catch (e) {
        console.error('Failed to parse notifications:', e);
      }
    }

    setNotifications([]);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    setIsInitialized(true);
  }, []);

  // Persist to localStorage whenever notifications change
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    }
  }, [notifications, isInitialized]);

  // Notify parent of unread count changes
  useEffect(() => {
    if (isInitialized) {
      const unreadCount = notifications.filter(n => !n.read).length;
      if (onUnreadCountChange) {
        onUnreadCountChange(unreadCount);
      }
    }
  }, [notifications, onUnreadCountChange, isInitialized]);

  // Listen for live updates from the reminder service
  useEffect(() => {
    const handleUpdate = () => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setNotifications(parsed);
          }
        } catch (e) {
          console.error('Failed to parse live notification update:', e);
        }
      }
    };
    window.addEventListener('notificationsUpdated', handleUpdate);
    return () => window.removeEventListener('notificationsUpdated', handleUpdate);
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'task':
        return <AlarmIcon color="warning" />;
      case 'reminder':
        return <NotificationsIcon color="info" />;
      case 'info':
        return <InfoIcon color="success" />;
      default:
        return <InfoIcon />;
    }
  };

  const formatTime = (timeString) => {
    const date = new Date(timeString);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const clearAll = () => {
    setNotifications([]);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '100%', sm: 380 },
          maxWidth: '100%',
          boxSizing: 'border-box',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Chip
              label={`${unreadCount} new`}
              size="small"
              color="primary"
              sx={{ height: 20, '& .MuiChip-label': { fontSize: '0.625rem', px: 1 } }}
            />
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {unreadCount > 0 && (
            <Button
              size="small"
              onClick={markAllAsRead}
              startIcon={<CheckCircleIcon />}
            >
              Mark all read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button
              size="small"
              onClick={clearAll}
              color="error"
              startIcon={<ClearAllIcon />}
            >
              Clear all
            </Button>
          )}
          <IconButton size="small" onClick={onClose} aria-label="Close notifications">
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Notification list */}
      {notifications.length === 0 ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: 'calc(100% - 70px)',
            p: 3,
          }}
        >
          <NotificationsIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No notifications
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You're all caught up!
          </Typography>
        </Box>
      ) : (
        <List sx={{ p: 0 }}>
          {notifications.map((notification, index) => (
            <React.Fragment key={notification.id}>
              <ListItem
                sx={{
                  py: 2,
                  px: 2,
                  bgcolor: notification.read ? 'transparent' : 'action.hover',
                  '&:hover': {
                    bgcolor: 'action.selected',
                  },
                  cursor: 'pointer',
                }}
                onClick={() => markAsRead(notification.id)}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {getIcon(notification.type)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: notification.read ? 400 : 600,
                          color: notification.read ? 'text.secondary' : 'text.primary',
                        }}
                      >
                        {notification.title}
                      </Typography>
                      {!notification.read && (
                        <Chip
                          label="New"
                          size="small"
                          color="primary"
                          sx={{ height: 20, '& .MuiChip-label': { fontSize: '0.625rem', px: 1 } }}
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5, fontSize: '0.875rem' }}
                      >
                        {notification.message}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.disabled"
                        sx={{ display: 'block', mt: 0.5 }}
                      >
                        {formatTime(notification.time)}
                      </Typography>
                    </Box>
                  }
                  slotProps={{
                    secondary: { component: 'div' },
                  }}
                />
              </ListItem>
              {index < notifications.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      )}
    </Drawer>
  );
};

export default NotificationDrawer;