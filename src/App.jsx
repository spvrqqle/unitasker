import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeContextProvider, useTheme } from './context/ThemeContext';
import { Box } from '@mui/material';
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
          {/* Placeholder content */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 3
          }}>
            <h1>Welcome to UniTasker</h1>
            <ThemeToggle />
          </Box>
          <Box sx={{ 
            backgroundColor: 'background.paper',
            p: 3,
            borderRadius: 2,
            boxShadow: 1
          }}>
            <p>Select a module from the navigation to get started.</p>
            <p style={{ marginTop: '8px', color: '#666' }}>
              Current view: Dashboard (coming soon)
            </p>
          </Box>
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