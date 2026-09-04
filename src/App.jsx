import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeContextProvider, useTheme } from './context/ThemeContext';
import { AppContextProvider, useAppContext } from './context/AppContext';
import { Box, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import Navigation from './components/common/Navigation';
import ThemeToggle from './components/common/ThemeToggle';

const AppContent = () => {
  const { theme } = useTheme();
  const { appLoading, error, isDBReady } = useAppContext();

  // Show loading state
  if (appLoading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '100vh',
          gap: 3
        }}>
          <CircularProgress size={60} />
          <Typography variant="h6" color="text.secondary">
            Loading UniTasker...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Initializing database
          </Typography>
        </Box>
      </ThemeProvider>
    );
  }

  // Show error state
  if (error) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '100vh',
          p: 3
        }}>
          <Alert severity="error" sx={{ maxWidth: 500 }}>
            <Typography variant="h6">Failed to initialize app</Typography>
            <Typography variant="body2">{error}</Typography>
          </Alert>
        </Box>
      </ThemeProvider>
    );
  }

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
            {isDBReady && (
              <Typography variant="caption" sx={{ mt: 2, display: 'block', color: 'success.main' }}>
                ✅ Database ready
              </Typography>
            )}
          </Paper>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

function App() {
  return (
    <ThemeContextProvider>
      <AppContextProvider>
        <AppContent />
      </AppContextProvider>
    </ThemeContextProvider>
  );
}

export default App;