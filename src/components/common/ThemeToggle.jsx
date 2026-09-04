import React, { useState } from 'react';
import { IconButton, Tooltip, Switch, FormControlLabel, Box, Badge } from '@mui/material';
import { WbSunny, DarkMode, NotificationsOutlined } from '@mui/icons-material';
import { useTheme as useThemeContext } from '../../context/ThemeContext';
import NotificationDrawer from './NotificationDrawer';

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useThemeContext();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2); // Start with 2 unread from sample

  const handleNotificationClick = () => {
    setNotificationOpen(true);
  };

  const handleNotificationClose = () => {
    setNotificationOpen(false);
  };

  const handleUnreadCountChange = (count) => {
    setUnreadCount(count);
  };

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* Notification Icon */}
        <Tooltip title="Notifications">
          <IconButton 
            color="inherit" 
            size="small"
            onClick={handleNotificationClick}
            sx={{ 
              p: 1,
              '&:hover': {
                backgroundColor: 'rgba(13, 110, 253, 0.08)',
              }
            }}
          >
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsOutlined />
            </Badge>
          </IconButton>
        </Tooltip>

        {/* Theme Toggle Switch */}
        <Tooltip title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}>
          <FormControlLabel
            control={
              <Switch
                checked={isDarkMode}
                onChange={toggleTheme}
                icon={<WbSunny sx={{ color: '#f57c00', fontSize: 20 }} />}
                checkedIcon={<DarkMode sx={{ color: '#90caf9', fontSize: 20 }} />}
                sx={{
                  '& .MuiSwitch-switchBase': {
                    '&.Mui-checked': {
                      color: '#90caf9',
                      '& + .MuiSwitch-track': {
                        backgroundColor: '#1a237e',
                      },
                    },
                  },
                  '& .MuiSwitch-track': {
                    backgroundColor: '#e0e0e0',
                  },
                }}
              />
            }
            label={isDarkMode ? 'Dark' : 'Light'}
            labelPlacement="end"
            sx={{ 
              m: 0,
              '& .MuiFormControlLabel-label': {
                fontSize: '0.75rem',
                fontWeight: 500,
                color: 'text.secondary',
                ml: 0.5,
              }
            }}
          />
        </Tooltip>
      </Box>

      {/* Notification Drawer */}
      <NotificationDrawer
        open={notificationOpen}
        onClose={handleNotificationClose}
        onUnreadCountChange={handleUnreadCountChange}
      />
    </>
  );
};

export default ThemeToggle;