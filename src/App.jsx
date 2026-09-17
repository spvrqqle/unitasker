import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeContextProvider, useTheme } from './context/ThemeContext';
import { AppContextProvider, useAppContext } from './context/AppContext';
import { TimerProvider } from './context/TimerContext';
import { Box, Typography, CircularProgress, Alert, Chip } from '@mui/material';
import { WifiOff as WifiOffIcon, Wifi as WifiIcon } from '@mui/icons-material';
import Navigation from './components/common/Navigation';
import ThemeToggle from './components/common/ThemeToggle';
import Dashboard from './components/dashboard/Dashboard';
import TaskList from './components/tasks/TaskList';
import NoteList from './components/notes/NoteList';
import CalendarView from './components/calendar/CalendarView';
import ResourceManager from './components/resources/ResourceManager';
import TimerView from './components/timer/TimerView';
import OfflineIndicator from './components/common/OfflineIndicator';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import Settings from './components/settings/Settings';

const AppContent = () => {
  const { theme } = useTheme();
  const { appLoading, error, isDBReady } = useAppContext();
  const isOnline = useOnlineStatus();
  const [currentTab, setCurrentTab] = useState(0);

  useEffect(() => {
    const handleNavigationChange = (event) => {
      const newTab = event.detail;
      setCurrentTab(newTab);
      window.dispatchEvent(new CustomEvent('updateNavigationTab', { detail: newTab }));
    };

    window.addEventListener('navigationChange', handleNavigationChange);
    return () => {
      window.removeEventListener('navigationChange', handleNavigationChange);
    };
  }, []);

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

  const renderView = () => {
    switch(currentTab) {
      case 0:
        return <Dashboard />;
      case 1:
        return <TaskList />;
      case 2:
        return <NoteList />;
      case 3:
        return <CalendarView />;
      case 4:
        return <ResourceManager />;
      case 5:
        return <TimerView />;
      case 6:
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  const getViewName = () => {
    const names = ['Dashboard', 'Tasks', 'Notes', 'Calendar', 'Resources', 'Timer', 'Settings'];
    return names[currentTab] || 'Dashboard';
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <Navigation currentTab={currentTab} />
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
                {getViewName()}
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
                    '& .MuiChip-label': { px: 1 },
                    '& .MuiChip-icon': { color: 'white' },
                    transition: 'all 0.3s ease',
                  }}
                />
              )}
            </Box>

            <ThemeToggle />
          </Box>

          {renderView()}
        </Box>
      </Box>

      <OfflineIndicator />
    </ThemeProvider>
  );
};

function App() {
  return (
    <ThemeContextProvider>
      <AppContextProvider>
        <TimerProvider>
          <AppContent />
        </TimerProvider>
      </AppContextProvider>
    </ThemeContextProvider>
  );
}

export default App;