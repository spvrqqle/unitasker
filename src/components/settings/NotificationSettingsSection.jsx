import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  FormControlLabel,
  Switch,
  Button,
  Stack,
  Alert,
  Chip,
  Tooltip,
  Snackbar,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  VolumeUp as SoundIcon,
  RecordVoiceOver as VoiceIcon,
  Vibration as VibrateIcon,
  PlayArrow as TestIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import {
  getNotificationPrefs,
  saveNotificationPrefs,
} from '../../services/notificationSettings.service';
import {
  fireTestAlert,
  testVoice,
  testSound,
  testVibration,
  getSupportedModes,
  requestNotificationPermission,
} from '../../services/reminder.service';

const NotificationSettingsSection = () => {
  const [prefs, setPrefs] = useState(getNotificationPrefs());
  const [supported, setSupported] = useState(getSupportedModes());
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  useEffect(() => {
    setPrefs(getNotificationPrefs());
    setSupported(getSupportedModes());
  }, []);

  const handleToggle = (key) => (e) => {
    const updated = { ...prefs, [key]: e.target.checked };
    setPrefs(updated);
    saveNotificationPrefs(updated);
  };

  const handleRequestPermission = async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
  };

  const handleTestAll = () => {
    fireTestAlert();
    setSnackbar({ open: true, message: 'Test notification sent — check your system tray' });
  };

  const handleTestSound = () => {
    testSound();
  };

  const handleTestVoice = () => {
    testVoice();
  };

  const handleTestVibration = () => {
    testVibration();
  };

  const showPermissionBanner = supported.visual && permission !== 'granted';

  return (
    <Paper sx={{
      p: 3,
      mb: 3,
      bgcolor: 'background.paper',
      border: `1px solid #ffffff1a`,
      borderRadius: 2,
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <NotificationsIcon sx={{ color: 'primary.main' }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Notifications
        </Typography>
      </Box>
      <Divider sx={{ mb: 2 }} />

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        UniTasker can prompt you in several ways. Enable the modes that suit your environment
        and accessibility needs.
      </Typography>

      {showPermissionBanner && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Browser notifications are not enabled yet. Click below to allow them.
          </Typography>
          <Button
            size="small"
            variant="outlined"
            onClick={handleRequestPermission}
            startIcon={<CheckIcon />}
          >
            Enable Browser Notifications
          </Button>
        </Alert>
      )}

      <Stack spacing={1.5}>
        {/* Visual */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 0.75 }}>
              Visual notifications
              {supported.visual && permission === 'granted' && (
                <Chip label="Active" size="small" color="success" sx={{ height: 18, fontSize: '0.6rem' }} />
              )}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              Show a popup on your desktop and add to the notification drawer
            </Typography>
          </Box>
          <FormControlLabel
            control={
              <Switch
                checked={prefs.visual}
                onChange={handleToggle('visual')}
                disabled={!supported.visual}
                size="small"
              />
            }
            label=""
            sx={{ m: 0 }}
          />
        </Box>

        {/* Sound */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Sound alert
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              Play a chime when a reminder fires
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Test sound" arrow>
              <Button
                size="small"
                onClick={handleTestSound}
                disabled={!supported.sound || !prefs.sound}
                sx={{ minWidth: 0, p: 0.5 }}
                aria-label="Test sound alert"
              >
                <SoundIcon fontSize="small" />
              </Button>
            </Tooltip>
            <FormControlLabel
              control={
                <Switch
                  checked={prefs.sound}
                  onChange={handleToggle('sound')}
                  disabled={!supported.sound}
                  size="small"
                />
              }
              label=""
              sx={{ m: 0 }}
            />
          </Box>
        </Box>

        {/* Voice */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Voice announcement
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              Read the reminder aloud — useful for accessibility or hands-free situations
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Test voice" arrow>
              <Button
                size="small"
                onClick={handleTestVoice}
                disabled={!supported.voice || !prefs.voice}
                sx={{ minWidth: 0, p: 0.5 }}
                aria-label="Test voice announcement"
              >
                <VoiceIcon fontSize="small" />
              </Button>
            </Tooltip>
            <FormControlLabel
              control={
                <Switch
                  checked={prefs.voice}
                  onChange={handleToggle('voice')}
                  disabled={!supported.voice}
                  size="small"
                />
              }
              label=""
              sx={{ m: 0 }}
            />
          </Box>
        </Box>

        {/* Vibration */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Vibration
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              Vibrate the device (mobile browsers only)
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Test vibration" arrow>
              <Button
                size="small"
                onClick={handleTestVibration}
                disabled={!supported.vibrate || !prefs.vibrate}
                sx={{ minWidth: 0, p: 0.5 }}
                aria-label="Test vibration"
              >
                <VibrateIcon fontSize="small" />
              </Button>
            </Tooltip>
            <FormControlLabel
              control={
                <Switch
                  checked={prefs.vibrate}
                  onChange={handleToggle('vibrate')}
                  disabled={!supported.vibrate}
                  size="small"
                />
              }
              label=""
              sx={{ m: 0 }}
            />
          </Box>
        </Box>
      </Stack>

      <Divider sx={{ my: 2.5 }} />

      {/* Test button */}
      <Button
        variant="contained"
        startIcon={<TestIcon />}
        onClick={handleTestAll}
        disabled={!prefs.visual && !prefs.sound && !prefs.voice && !prefs.vibrate}
        aria-label="Send a test notification"
      >
        Send Test Notification
      </Button>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, fontSize: '0.7rem' }}>
        Fires an immediate reminder using all the modes you've enabled.
      </Typography>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2500}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        message={snackbar.message}
      />
    </Paper>
  );
};

export default NotificationSettingsSection;