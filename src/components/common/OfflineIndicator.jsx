import React, { useState, useEffect } from 'react';
import {
  Snackbar,
  Alert,
  Box,
  Typography,
} from '@mui/material';
import { WifiOff as WifiOffIcon } from '@mui/icons-material';

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOffline, setShowOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOffline(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Show offline banner when offline
  if (!isOnline) {
    return (
      <Snackbar
        open={showOffline}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ mt: 7 }}
      >
        <Alert
          severity="warning"
          icon={<WifiOffIcon />}
          sx={{
            width: '100%',
            '& .MuiAlert-message': {
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }
          }}
        >
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              You are offline
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Your data is safe. Changes will sync when you're back online.
            </Typography>
          </Box>
        </Alert>
      </Snackbar>
    );
  }

  return null;
};

export default OfflineIndicator;