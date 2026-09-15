import React from 'react';
import { Box, Typography } from '@mui/material';

const CircularTimer = ({ 
  progress,          // 0 to 1 (1 = full, 0 = done)
  timeLeft,          // seconds
  mode,              // 'focus' | 'shortBreak' | 'longBreak'
  color,             // hex color
  isRunning,
}) => {
  const size = 320;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const modeLabels = {
    focus: 'Focus',
    shortBreak: 'Short Break',
    longBreak: 'Long Break',
  };

  return (
    <Box sx={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          style={{ color: 'rgba(128,128,128,0.15)' }}
        />
        {/* Progress circle */}
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

      {/* Center content */}
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
            fontSize: '3.5rem',
            lineHeight: 1,
            color: 'text.primary',
          }}
        >
          {formatTime(timeLeft)}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            mt: 1,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: 1.5,
            fontSize: '0.75rem',
            color: color,
          }}
        >
          {modeLabels[mode]}
        </Typography>
      </Box>
    </Box>
  );
};

export default CircularTimer;