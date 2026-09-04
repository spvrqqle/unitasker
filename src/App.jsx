import React, { useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeContextProvider, useTheme } from './context/ThemeContext';
import { AppContextProvider, useAppContext } from './context/AppContext';
import { Box, Typography, CircularProgress, Alert, Chip } from '@mui/material';
import { WifiOff as WifiOffIcon, Wifi as WifiIcon } from '@mui/icons-material';
import Navigation from './components/common/Navigation';
import ThemeToggle from './components/common/ThemeToggle';
import TaskList from './components/tasks/TaskList';
import NoteList from './components/notes/NoteList';
import OfflineIndicator from './components/common/OfflineIndicator';
import { useOnlineStatus } from './hooks/useOnlineStatus';

const AppContent = () => {
  const { theme } = useTheme();
  const { appLoading, error, isDBReady } = useAppContext();
  const isOnline = useOnlineStatus();
  const [currentView, setCurrentView] = useState(1); // 0: Dashboard, 1: Tasks, 2: Notes, etc.

  // We'll use the Navigation's tab state later via context
  // For now, we'll use a simple state

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

  // Render the appropriate view based on current tab
  const renderView = () => {
    // For now, we'll show Tasks by default
    // Later we'll connect this to the Navigation tab state
    return <TaskList />;
  };

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
                  icon={isOnline ? <WifiIcon sx={{ fontSize: 16 }} /> : <WifiOffIcon sx={{ fontSize: 16 }} />}
                  label={isOnline ? 'Online' : 'Offline'}
                  size="small"
                  sx={{
                    bgcolor: isOnline ? 'success.main' : 'error.main',
                    color: 'white',
                    fontWeight: 600,
                    '& .MuiChip-label': {
                      px: 1,
                    },
                    '& .MuiChip-icon': {
                      color: 'white',
                    },
                    transition: 'all 0.3s ease',
                  }}
                />
              )}
            </Box>
            
            <ThemeToggle />
          </Box>
          
          {/* Render the current view */}
          {renderView()}
        </Box>
      </Box>
      
      {/* Offline Indicator */}
      <OfflineIndicator />
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