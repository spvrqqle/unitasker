import React, { useState, useEffect } from 'react';
import {
  Snackbar,
  Alert,
  Box,
  Typography,
} from '@mui/material';
import { WifiOff as WifiOffIcon } from '@mui/icons-material';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

const OfflineIndicator = () => {
  const isOnline = useOnlineStatus();
  const [showOffline, setShowOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShowOffline(true);
    } else {
      // Small delay before hiding to allow the user to see the online transition
      const timer = setTimeout(() => {
        setShowOffline(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  // Show offline banner when offline
  if (!isOnline && showOffline) {
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