import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeContextProvider, useTheme } from './context/ThemeContext';
import { Box, Typography, Paper } from '@mui/material';
import Navigation from './components/common/Navigation';
import ThemeToggle from './components/common/ThemeToggle';

const AppContent = () => {
  const { theme } = useTheme();
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <Navigation />
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            p: 3,
            width: { sm: `calc(100% - 240px)` },
            mt: { xs: 7, sm: 0 },
            mb: { xs: 7, sm: 0 }
          }}
        >
          {/* Header with theme toggle */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 3,
            flexWrap: 'wrap',
            gap: 2
          }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
              Welcome to UniTasker
            </Typography>
            <ThemeToggle />
          </Box>
          
          <Paper sx={{ 
            p: 3,
            borderRadius: 2,
            boxShadow: 1
          }}>
            <Typography variant="body1" color="text.secondary">
              Select a module from the navigation to get started.
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, color: 'text.disabled' }}>
              Current view: Dashboard (coming soon)
            </Typography>
          </Paper>
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