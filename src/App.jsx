import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeContextProvider, useTheme } from './context/ThemeContext';
import { AppContextProvider, useAppContext } from './context/AppContext';
import { Box, Typography, CircularProgress, Alert, Chip } from '@mui/material';
import Navigation from './components/common/Navigation';
import ThemeToggle from './components/common/ThemeToggle';
import TaskList from './components/tasks/TaskList';

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
            p: { xs: 2, sm: 3 },
            width: { sm: `calc(100% - 240px)` },
            mt: { xs: 7, sm: 0 },
            mb: { xs: 7, sm: 0 },
            overflow: 'auto',
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 3,
            flexWrap: 'wrap',
            gap: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
                UniTasker
              </Typography>
              {isDBReady && (
                <Chip
                  label="● Online"
                  size="small"
                  sx={{
                    bgcolor: 'success.main',
                    color: 'white',
                    fontWeight: 600,
                    '& .MuiChip-label': {
                      px: 1,
                    }
                  }}
                />
              )}
            </Box>
            <ThemeToggle />
          </Box>
          
          {/* Task List */}
          <TaskList />
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