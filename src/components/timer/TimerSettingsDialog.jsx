import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  IconButton,
  useTheme,
  useMediaQuery,
  Typography,
  Divider,
  Box,
} from '@mui/material';
import {
  Close as CloseIcon,
  RestartAlt as ResetIcon,
} from '@mui/icons-material';
import { usePomodoroSettings } from '../../hooks/usePomodoroSettings';

const TimerSettingsDialog = ({ open, onClose }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { settings, updateSetting, resetSettings } = usePomodoroSettings();

  const [form, setForm] = useState(settings);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(settings);
      setErrors({});
    }
  }, [open, settings]);

  const handleChange = (field) => (e) => {
    const raw = e.target.value;
    setForm(prev => ({ ...prev, [field]: raw }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const errs = {};
    const check = (field, min, max, label) => {
      const val = Number(form[field]);
      if (!Number.isFinite(val) || val < min || val > max) {
        errs[field] = `${label} must be between ${min} and ${max}`;
      }
    };
    check('focusMinutes', 1, 120, 'Focus duration');
    check('shortBreakMinutes', 1, 60, 'Short break');
    check('longBreakMinutes', 1, 60, 'Long break');
    check('sessionsBeforeLongBreak', 1, 12, 'Sessions before long break');
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    updateSetting('focusMinutes', Number(form.focusMinutes));
    updateSetting('shortBreakMinutes', Number(form.shortBreakMinutes));
    updateSetting('longBreakMinutes', Number(form.longBreakMinutes));
    updateSetting('sessionsBeforeLongBreak', Number(form.sessionsBeforeLongBreak));
    onClose();
  };

  const handleReset = () => {
    resetSettings();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Timer Settings</span>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
              Session Durations
            </Typography>
            <Stack spacing={2}>
              <TextField
                label="Focus duration (minutes)"
                type="number"
                value={form.focusMinutes}
                onChange={handleChange('focusMinutes')}
                error={!!errors.focusMinutes}
                helperText={errors.focusMinutes || 'How long each focus session lasts'}
                fullWidth
                slotProps={{ 
                  inputLabel: { shrink: true },
                  htmlInput: { min: 1, max: 120 },
                }}
              />
              <TextField
                label="Short break (minutes)"
                type="number"
                value={form.shortBreakMinutes}
                onChange={handleChange('shortBreakMinutes')}
                error={!!errors.shortBreakMinutes}
                helperText={errors.shortBreakMinutes || 'Short break between focus sessions'}
                fullWidth
                slotProps={{ 
                  inputLabel: { shrink: true },
                  htmlInput: { min: 1, max: 60 },
                }}
              />
              <TextField
                label="Long break (minutes)"
                type="number"
                value={form.longBreakMinutes}
                onChange={handleChange('longBreakMinutes')}
                error={!!errors.longBreakMinutes}
                helperText={errors.longBreakMinutes || 'Longer break after a full cycle'}
                fullWidth
                slotProps={{ 
                  inputLabel: { shrink: true },
                  htmlInput: { min: 1, max: 60 },
                }}
              />
            </Stack>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
              Cycle
            </Typography>
            <TextField
              label="Focus sessions before long break"
              type="number"
              value={form.sessionsBeforeLongBreak}
              onChange={handleChange('sessionsBeforeLongBreak')}
              error={!!errors.sessionsBeforeLongBreak}
              helperText={errors.sessionsBeforeLongBreak || 'e.g., 4 = after every 4th focus session, take a long break'}
              fullWidth
              slotProps={{ 
                inputLabel: { shrink: true },
                htmlInput: { min: 1, max: 12 },
              }}
            />
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1, justifyContent: 'space-between' }}>
        <Button onClick={handleReset} color="inherit" startIcon={<ResetIcon />}>
          Reset to Defaults
        </Button>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained">
            Save
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default TimerSettingsDialog;