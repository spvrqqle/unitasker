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

// Sample notifications data
const SAMPLE_NOTIFICATIONS = [
  {
    id: 1,
    type: 'task',
    title: 'Task Due Soon',
    message: 'Complete project proposal is due in 2 hours',
    time: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    read: false,
  },
  {
    id: 2,
    type: 'reminder',
    title: 'Reminder',
    message: 'Team meeting at 3:00 PM',
    time: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    read: false,
  },
  {
    id: 3,
    type: 'info',
    title: 'Task Completed',
    message: 'You completed "Update documentation"',
    time: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    read: true,
  },
];

const NotificationDrawer = ({ open, onClose, onUnreadCountChange }) => {
  const theme = useTheme();
  
  const [notifications, setNotifications] = useState(SAMPLE_NOTIFICATIONS);

  // Update unread count whenever notifications change
  useEffect(() => {
    const unreadCount = notifications.filter(n => !n.read).length;
    if (onUnreadCountChange) {
      onUnreadCountChange(unreadCount);
    }
  }, [notifications, onUnreadCountChange]);

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
            <IconButton size="small" onClick={clearAll} title="Clear all">
              <ClearAllIcon />
            </IconButton>
          )}
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Notification List */}
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
                  secondaryTypographyProps={{ component: 'div' }}
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