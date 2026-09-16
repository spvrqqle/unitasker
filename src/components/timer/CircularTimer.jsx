import React from 'react';
import { Box, Typography } from '@mui/material';
import { MODE_META } from '../../hooks/usePomodoro';

const CircularTimer = ({ 
  progress,
  timeLeft,
  mode,
  color,
  isRunning,
}) => {
  const size = 200;
  const strokeWidth = 9;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const modeLabel = MODE_META[mode]?.label || 'Focus';

  return (
    <Box sx={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          style={{ color: 'rgba(128,128,128,0.15)' }}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 0.5s linear',
            filter: isRunning ? `drop-shadow(0 0 8px ${color}80)` : 'none',
          }}
        />
      </svg>

      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography
          variant="h2"
          sx={{
            fontFamily: 'monospace',
            fontWeight: 700,
            fontSize: '2.25rem',
            lineHeight: 1,
            color: 'text.primary',
          }}
        >
          {formatTime(timeLeft)}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            mt: 0.5,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: 1.5,
            fontSize: '0.65rem',
            color: color,
          }}
        >
          {modeLabel}
        </Typography>
      </Box>
    </Box>
  );
};

export default CircularTimer;