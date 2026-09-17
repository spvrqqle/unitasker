import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Divider,
  IconButton,
  Badge,
  Chip,
  Tooltip,
  Checkbox,
  Button,
  Stack,
  useTheme,
} from '@mui/material';
import {
  Close as CloseIcon,
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  Alarm as AlarmIcon,
  Info as InfoIcon,
  Delete as DeleteIcon,
  MarkEmailRead as MarkEmailReadIcon,
  DoneAll as DoneAllIcon,
  DeleteSweep as DeleteSweepIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  CheckBox as CheckBoxIcon,
} from '@mui/icons-material';

const STORAGE_KEY = 'unitaser_notifications';

const NotificationDrawer = ({ open, onClose, onUnreadCountChange }) => {
  const theme = useTheme();

  const [notifications, setNotifications] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  // ---------- Load ----------
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
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

  // ---------- Persist ----------
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    }
  }, [notifications, isInitialized]);

  // ---------- Unread count ----------
  useEffect(() => {
    if (isInitialized) {
      const unread = notifications.filter(n => !n.read).length;
      onUnreadCountChange?.(unread);
    }
  }, [notifications, onUnreadCountChange, isInitialized]);

  // ---------- Live updates ----------
  useEffect(() => {
    const handleUpdate = () => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setNotifications(parsed);
        } catch (e) {}
      }
    };
    window.addEventListener('notificationsUpdated', handleUpdate);
    return () => window.removeEventListener('notificationsUpdated', handleUpdate);
  }, []);

  // ---------- Reset selection when drawer closes ----------
  useEffect(() => {
    if (!open) {
      setSelectionMode(false);
      setSelectedIds([]);
    }
  }, [open]);

  // ---------- Actions ----------
  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markSelectedAsRead = () => {
    setNotifications(prev =>
      prev.map(n => (selectedIds.includes(n.id) ? { ...n, read: true } : n))
    );
    setSelectedIds([]);
    setSelectionMode(false);
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setSelectedIds([]);
    setSelectionMode(false);
  };

  const deleteSelected = () => {
    if (selectedIds.length === 0) return;
    setNotifications(prev => prev.filter(n => !selectedIds.includes(n.id)));
    setSelectedIds([]);
    setSelectionMode(false);
  };

  const clearAll = () => {
    setNotifications([]);
    setSelectedIds([]);
    setSelectionMode(false);
  };

  const toggleSelection = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectionMode = () => {
    if (selectionMode) {
      setSelectionMode(false);
      setSelectedIds([]);
    } else {
      setSelectionMode(true);
    }
  };

  const selectAll = () => {
    if (selectedIds.length === notifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(notifications.map(n => n.id));
    }
  };

  // ---------- Helpers ----------
  const getIcon = (type) => {
    switch (type) {
      case 'task':
        return <AlarmIcon color="warning" fontSize="small" />;
      case 'reminder':
        return <NotificationsIcon color="info" fontSize="small" />;
      case 'info':
        return <InfoIcon color="success" fontSize="small" />;
      default:
        return <InfoIcon fontSize="small" />;
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

  const unreadCount = notifications.filter(n => !n.read).length;
  const allSelected = notifications.length > 0 && selectedIds.length === notifications.length;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '100%', sm: 400 },
          maxWidth: '100%',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
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
          flexShrink: 0,
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

        <Stack direction="row" spacing={0.5} alignItems="center">
          {/* Enter/exit selection mode */}
          {notifications.length > 0 && (
            <Tooltip title={selectionMode ? 'Cancel selection' : 'Select notifications'} arrow>
              <IconButton
                size="small"
                onClick={toggleSelectionMode}
                aria-label={selectionMode ? 'Cancel selection' : 'Select notifications'}
                color={selectionMode ? 'primary' : 'default'}
              >
                <CheckBoxIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          {/* Mark all read */}
          {!selectionMode && unreadCount > 0 && (
            <Tooltip title="Mark all as read" arrow>
              <IconButton size="small" onClick={markAllAsRead} aria-label="Mark all as read">
                <DoneAllIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          {/* Clear all */}
          {!selectionMode && notifications.length > 0 && (
            <Tooltip title="Clear all" arrow>
              <IconButton
                size="small"
                onClick={clearAll}
                aria-label="Clear all notifications"
                color="error"
              >
                <DeleteSweepIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          {/* Close */}
          <Tooltip title="Close" arrow>
            <IconButton size="small" onClick={onClose} aria-label="Close notifications">
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* Selection toolbar */}
      {selectionMode && notifications.length > 0 && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1,
            borderBottom: `1px solid ${theme.palette.divider}`,
            bgcolor: 'action.hover',
            flexShrink: 0,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title={allSelected ? 'Deselect all' : 'Select all'} arrow>
              <IconButton size="small" onClick={selectAll} aria-label={allSelected ? 'Deselect all' : 'Select all'}>
                {allSelected ? <CheckBoxIcon fontSize="small" /> : <CheckBoxOutlineBlankIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {selectedIds.length} selected
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Mark selected as read" arrow>
              <span>
                <IconButton
                  size="small"
                  onClick={markSelectedAsRead}
                  disabled={selectedIds.length === 0}
                  aria-label="Mark selected as read"
                >
                  <MarkEmailReadIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Delete selected" arrow>
              <span>
                <IconButton
                  size="small"
                  onClick={deleteSelected}
                  disabled={selectedIds.length === 0}
                  color="error"
                  aria-label="Delete selected"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Box>
      )}

      {/* List */}
      <Box sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
        {notifications.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
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
            {notifications.map((notification, index) => {
              const isSelected = selectedIds.includes(notification.id);
              return (
                <React.Fragment key={notification.id}>
                  <ListItem
                    disablePadding
                    secondaryAction={
                      !selectionMode && !notification.read ? (
                        <Tooltip title="Mark as read" arrow>
                          <IconButton
                            size="small"
                            edge="end"
                            onClick={() => markAsRead(notification.id)}
                            aria-label="Mark as read"
                            sx={{ mr: 0.5 }}
                          >
                            <CheckCircleIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ) : null
                    }
                  >
                    <ListItemButton
                      onClick={() => {
                        if (selectionMode) {
                          toggleSelection(notification.id);
                        } else if (!notification.read) {
                          markAsRead(notification.id);
                        }
                      }}
                      sx={{
                        py: 1.5,
                        px: 2,
                        bgcolor: isSelected
                          ? 'action.selected'
                          : notification.read
                            ? 'transparent'
                            : 'action.hover',
                        '&:hover': {
                          bgcolor: isSelected ? 'action.selected' : 'action.hover',
                        },
                      }}
                    >
                      {/* Checkbox in selection mode */}
                      {selectionMode && (
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <Checkbox
                            edge="start"
                            checked={isSelected}
                            tabIndex={-1}
                            disableRipple
                            slotProps={{
                              htmlInput: { 'aria-label': `Select notification ${notification.title}` },
                            }}
                          />
                        </ListItemIcon>
                      )}

                      {/* Type icon */}
                      {!selectionMode && (
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          {getIcon(notification.type)}
                        </ListItemIcon>
                      )}

                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pr: 4 }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: notification.read ? 400 : 600,
                                color: notification.read ? 'text.secondary' : 'text.primary',
                                flex: 1,
                                minWidth: 0,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {notification.title}
                            </Typography>
                            {!notification.read && !selectionMode && (
                              <Chip
                                label="New"
                                size="small"
                                color="primary"
                                sx={{
                                  height: 18,
                                  flexShrink: 0,
                                  '& .MuiChip-label': { fontSize: '0.6rem', px: 0.75 },
                                }}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 0.5 }}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              component="div"
                              sx={{ fontSize: '0.8rem', lineHeight: 1.3 }}
                            >
                              {notification.message}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.disabled"
                              component="div"
                              sx={{ display: 'block', mt: 0.5, fontSize: '0.7rem' }}
                            >
                              {formatTime(notification.time)}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                  {index < notifications.length - 1 && <Divider />}
                </React.Fragment>
              );
            })}
          </List>
        )}
      </Box>

      {/* Bottom action bar in selection mode */}
      {selectionMode && notifications.length > 0 && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 1.5,
            borderTop: `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper',
            flexShrink: 0,
          }}
        >
          <Button size="small" onClick={toggleSelectionMode} color="inherit">
            Cancel
          </Button>
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<MarkEmailReadIcon />}
              onClick={markSelectedAsRead}
              disabled={selectedIds.length === 0}
            >
              Mark read
            </Button>
            <Button
              size="small"
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={deleteSelected}
              disabled={selectedIds.length === 0}
            >
              Delete
            </Button>
          </Stack>
        </Box>
      )}
    </Drawer>
  );
};

export default NotificationDrawer;