import React from 'react';
import { IconButton, Tooltip, useTheme, Switch, FormControlLabel, Box } from '@mui/material';
import { Brightness4, Brightness7, WbSunny, DarkMode } from '@mui/icons-material';
import { useTheme as useThemeContext } from '../../context/ThemeContext';

const ThemeToggle = () => {
  const theme = useTheme();
  const { isDarkMode, toggleTheme } = useThemeContext();

  // For desktop - use a switch with icons
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Tooltip title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}>
        <FormControlLabel
          control={
            <Switch
              checked={isDarkMode}
              onChange={toggleTheme}
              icon={<WbSunny sx={{ color: '#f57c00' }} />}
              checkedIcon={<DarkMode sx={{ color: '#90caf9' }} />}
              sx={{
                '& .MuiSwitch-switchBase': {
                  '&.Mui-checked': {
                    color: '#90caf9',
                    '& + .MuiSwitch-track': {
                      backgroundColor: '#1a237e',
                    },
                  },
                },
              }}
            />
          }
          label={isDarkMode ? 'Dark' : 'Light'}
          labelPlacement="start"
          sx={{ 
            '& .MuiFormControlLabel-label': {
              fontSize: '0.875rem',
              fontWeight: 500,
            }
          }}
        />
      </Tooltip>
    </Box>
  );
};

export default ThemeToggle;