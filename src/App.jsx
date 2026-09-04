import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeContextProvider, useTheme } from './context/ThemeContext';
import { Box, Typography, Button, Avatar } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

const AppContent = () => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3
      }}>
        <Box sx={{ 
          maxWidth: 600, 
          textAlign: 'center',
          backgroundColor: 'background.paper',
          p: 4,
          borderRadius: 2,
          boxShadow: 1
        }}>
          {/* Logo */}
          <Avatar 
            src="/favicon.png" 
            alt="UniTasker Logo"
            sx={{ 
              width: 80, 
              height: 80, 
              margin: '0 auto 16px',
              bgcolor: 'primary.main'
            }}
          />
          <Typography variant="h2" gutterBottom color="primary">
            UniTasker
          </Typography>
          <Typography variant="h5" gutterBottom color="text.secondary">
            Offline-First Productivity PWA
          </Typography>
          <Typography variant="body1" sx={{ mt: 2, mb: 3 }}>
            Your all-in-one productivity platform
          </Typography>
          <Button 
            variant="contained" 
            startIcon={isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            onClick={toggleTheme}
          >
            Switch to {isDarkMode ? 'Light' : 'Dark'} Mode
          </Button>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

function App() {
  return (
    <ThemeContextProvider>
      <AppContent />
    </ThemeContextProvider>
  );
}

export default App;