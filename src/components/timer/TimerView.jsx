import React from 'react';
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
} from '@mui/icons-material';
import CircularTimer from './CircularTimer';
import { useTimer } from '../../context/TimerContext';
import { MODES } from '../../hooks/usePomodoro';

const TimerView = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const {
    mode,
    timeLeft,
    isRunning,
    stats,
    autoStartBreaks,
    setAutoStartBreaks,
    start,
    pause,
    reset,
    switchMode,
  } = useTimer();

  const activeMode = MODES[mode];
  const progress = timeLeft / activeMode.duration;

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
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
      {/* Mode switcher */}
      <Paper sx={{ p: 1, display: 'flex', gap: 1, flexShrink: 0 }}>
        {Object.entries(MODES).map(([key, config]) => (
          <Button
            key={key}
            onClick={() => switchMode(key)}
            variant={mode === key ? 'contained' : 'text'}
            sx={{
              flex: 1,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.85rem',
              py: 0.75,
              ...(mode === key && {
                bgcolor: config.color,
                '&:hover': { bgcolor: config.color, filter: 'brightness(0.9)' },
              }),
            }}
          >
            {config.label}
          </Button>
        ))}
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
            color={activeMode.color}
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
              bgcolor: activeMode.color,
              '&:hover': { 
                bgcolor: activeMode.color, 
                filter: 'brightness(0.9)',
              },
            }}
          >
            {isRunning ? 'Pause' : 'Start'}
          </Button>

          <Tooltip title="Reset">
            <IconButton
              onClick={reset}
              sx={{
                mt: 2,
                width: 40,
                height: 40,
                border: `1px solid ${theme.palette.divider}`,
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <ResetIcon fontSize="small" />
            </IconButton>
          </Tooltip>
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

          <Divider sx={{ mt: 'auto' }} />

          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={autoStartBreaks}
                  onChange={(e) => setAutoStartBreaks(e.target.checked)}
                  size="small"
                />
              }
              label={
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                  Auto-start next session
                </Typography>
              }
              sx={{ m: 0 }}
            />
            <Typography 
              variant="caption" 
              color="text.disabled" 
              sx={{ display: 'block', mt: 1, fontSize: '0.65rem', lineHeight: 1.4 }}
            >
              When enabled, breaks and focus sessions will automatically begin after each one ends.
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default TimerView;