import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  FormControlLabel,
  Switch,
  IconButton,
  Tooltip,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  Refresh as ResetIcon,
  Settings as SettingsIcon,
  SkipNext as SkipIcon,
} from '@mui/icons-material';
import CircularTimer from './CircularTimer';
import TimerSettingsDialog from './TimerSettingsDialog';
import { useTimer } from '../../context/TimerContext';
import { MODE_META } from '../../hooks/usePomodoro';
import { usePomodoroSettings } from '../../hooks/usePomodoroSettings';

const TimerView = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [settingsOpen, setSettingsOpen] = useState(false);

  const {
    mode,
    timeLeft,
    isRunning,
    stats,
    sessionsUntilLongBreak,
    start,
    pause,
    reset,
    switchMode,
    skip,
  } = useTimer();

  const { settings, updateSetting } = usePomodoroSettings();

  const activeMeta = MODE_META[mode];

  const modeDuration = {
    focus: settings.focusMinutes * 60,
    shortBreak: settings.shortBreakMinutes * 60,
    longBreak: settings.longBreakMinutes * 60,
  }[mode];

  const progress = modeDuration > 0 ? timeLeft / modeDuration : 0;

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  return (
    <Box sx={{ 
      height: 'calc(100vh - 140px)',
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      overflow: 'hidden',
    }}>
      {/* Mode switcher + settings */}
      <Paper sx={{ p: 1, display: 'flex', gap: 1, flexShrink: 0, alignItems: 'center' }}>
        {Object.entries(MODE_META).map(([key, config]) => {
          const isActive = mode === key;
          const isDisabled = isRunning;  // ← disable while running
          return (
            <Tooltip
              key={key}
              title={isDisabled ? 'Pause the timer to switch modes' : ''}
              arrow
              disableHoverListener={!isDisabled}
            >
              <span style={{ flex: 1 }}>
                <Button
                  fullWidth
                  disabled={isDisabled}
                  onClick={() => switchMode(key)}
                  variant={isActive ? 'contained' : 'text'}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    py: 0.75,
                    ...(isActive && {
                      bgcolor: config.color,
                      '&:hover': {
                        bgcolor: config.color,
                        filter: 'brightness(0.9)',
                      },
                    }),
                  }}
                >
                  {config.label}
                </Button>
              </span>
            </Tooltip>
          );
        })}
        <Tooltip title="Timer settings" arrow>
          <IconButton
            onClick={() => setSettingsOpen(true)}
            sx={{ ml: 0.5, flexShrink: 0 }}
          >
            <SettingsIcon />
          </IconButton>
        </Tooltip>
      </Paper>

      {/* Main timer area */}
      <Box sx={{ 
        flex: 1,
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: 2,
        minHeight: 0,
      }}>
        {/* Timer card */}
        <Paper sx={{ 
          flex: isMobile ? 1 : 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
          minHeight: 0,
          overflow: 'hidden',
        }}>
          <CircularTimer
            progress={progress}
            timeLeft={timeLeft}
            mode={mode}
            color={activeMeta.color}
            isRunning={isRunning}
          />

          <Button
            variant="contained"
            onClick={isRunning ? pause : start}
            startIcon={isRunning ? <PauseIcon /> : <PlayArrowIcon />}
            sx={{
              mt: 5,
              px: 5,
              py: 1.25,
              fontSize: '0.95rem',
              fontWeight: 700,
              letterSpacing: 1,
              bgcolor: activeMeta.color,
              '&:hover': { 
                bgcolor: activeMeta.color, 
                filter: 'brightness(0.9)',
              },
            }}
          >
            {isRunning ? 'Pause' : 'Start'}
          </Button>

          {/* Reset + Skip row */}
          <Box sx={{ display: 'flex', gap: 1.5, mt: 2 }}>
            <Tooltip title="Reset" arrow>
              <IconButton
                onClick={reset}
                sx={{
                  width: 40,
                  height: 40,
                  border: `1px solid ${theme.palette.divider}`,
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <ResetIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Skip to next session" arrow>
              <span>
                <IconButton
                  onClick={skip}
                  disabled={!isRunning}
                  sx={{
                    width: 40,
                    height: 40,
                    border: `1px solid ${theme.palette.divider}`,
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <SkipIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Paper>

        {/* Stats panel */}
        <Paper sx={{ 
          flex: 1,
          p: 2.5,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          minHeight: 0,
          overflow: 'auto',
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
            Today
          </Typography>

          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              Completed focus sessions
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5 }}>
              {stats.completedSessions}
            </Typography>
          </Box>

          <Divider />

          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              Total focus time
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5 }}>
              {formatDuration(stats.totalFocusSeconds)}
            </Typography>
          </Box>

          <Divider />

          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              Sessions until long break
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5 }}>
              {sessionsUntilLongBreak}
            </Typography>
          </Box>

          <Divider sx={{ mt: 'auto' }} />

          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.autoStartBreaks}
                  onChange={(e) => updateSetting('autoStartBreaks', e.target.checked)}
                  size="small"
                />
              }
              label={
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                  Auto-start breaks
                </Typography>
              }
              sx={{ m: 0, display: 'flex' }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.autoStartFocus}
                  onChange={(e) => updateSetting('autoStartFocus', e.target.checked)}
                  size="small"
                />
              }
              label={
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                  Auto-start next focus
                </Typography>
              }
              sx={{ m: 0, display: 'flex' }}
            />
          </Box>
        </Paper>
      </Box>

      <TimerSettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </Box>
  );
};

export default TimerView;