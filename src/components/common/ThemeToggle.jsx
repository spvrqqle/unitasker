import React, { useState } from 'react';
import { IconButton, Tooltip, Box, Badge } from '@mui/material';
import {
  LightMode as SunIcon,
  DarkMode as MoonIcon,
  NotificationsOutlined,
} from '@mui/icons-material';
import { useTheme as useThemeContext } from '../../context/ThemeContext';
import NotificationDrawer from './NotificationDrawer';

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useThemeContext();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  React.useEffect(() => {
    const savedNotifications = localStorage.getItem('unitaser_notifications');
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications);
        if (Array.isArray(parsed)) {
          const count = parsed.filter(n => !n.read).length;
          setUnreadCount(count);
        }
      } catch (e) {
        console.error('Failed to parse notifications:', e);
      }
    }
    setIsInitialized(true);
  }, []);

  const handleNotificationClick = () => {
    setNotificationOpen(true);
  };

  const handleNotificationClose = () => {
    setNotificationOpen(false);
  };

  const handleUnreadCountChange = (count) => {
    setUnreadCount(count);
  };

  const showBadge = isInitialized && unreadCount > 0;

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {/* Notification bell */}
        <Tooltip title="Notifications" arrow>
          <IconButton
            size="small"
            onClick={handleNotificationClick}
            aria-label="Open notifications"
            sx={{
              p: 1,
              '&:hover': {
                backgroundColor: 'action.hover',
              },
              '&:focus-visible': {
                outline: `2px solid currentColor`,
                outlineOffset: 2,
              },
            }}
          >
            {showBadge ? (
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsOutlined fontSize="small" />
              </Badge>
            ) : (
              <NotificationsOutlined fontSize="small" />
            )}
          </IconButton>
        </Tooltip>

        {/* Theme toggle icon */}
        <Tooltip title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'} arrow>
          <IconButton
            size="small"
            onClick={toggleTheme}
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            sx={{
              p: 1,
              transition: 'transform 0.3s ease, color 0.3s ease',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
              '&:active': {
                transform: 'scale(0.9)',
              },
              '&:focus-visible': {
                outline: `2px solid currentColor`,
                outlineOffset: 2,
              },
            }}
          >
            {isDarkMode ? (
              <MoonIcon 
                fontSize="small"
                sx={{ 
                  color: '#90caf9',
                  transition: 'color 0.3s ease',
                }} 
              />
            ) : (
              <SunIcon 
                fontSize="small"
                sx={{ 
                  color: '#f57c00',
                  transition: 'color 0.3s ease',
                }} 
              />
            )}
          </IconButton>
        </Tooltip>
      </Box>

      <NotificationDrawer
        open={notificationOpen}
        onClose={handleNotificationClose}
        onUnreadCountChange={handleUnreadCountChange}
      />
    </>
  );
};

export default ThemeToggle;