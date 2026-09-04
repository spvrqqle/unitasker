import React, { useState } from 'react';
import {
  Paper,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Toolbar,
  Avatar,
  Typography,
  IconButton,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Task as TaskIcon,
  Note as NoteIcon,
  CalendarToday as CalendarIcon,
  Folder as FolderIcon,
  Timer as TimerIcon,
  Settings as SettingsIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';

const Navigation = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  
  const [currentTab, setCurrentTab] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const navItems = [
    { label: 'Dashboard', icon: <DashboardIcon />, value: 0 },
    { label: 'Tasks', icon: <TaskIcon />, value: 1 },
    { label: 'Notes', icon: <NoteIcon />, value: 2 },
    { label: 'Calendar', icon: <CalendarIcon />, value: 3 },
    { label: 'Resources', icon: <FolderIcon />, value: 4 },
    { label: 'Timer', icon: <TimerIcon />, value: 5 },
    { label: 'Settings', icon: <SettingsIcon />, value: 6 },
  ];

  const handleNavigation = (event, newValue) => {
    setCurrentTab(newValue);
    console.log('Navigating to:', navItems[newValue].label);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Mobile: Bottom Navigation
  if (isMobile) {
    return (
      <>
        {/* Top app bar for mobile */}
        <Paper 
          sx={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0,
            zIndex: theme.zIndex.appBar,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 1,
            px: 2,
            borderRadius: 0,
            borderBottom: `1px solid ${theme.palette.divider}`
          }} 
          elevation={2}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar 
              src="/favicon.png" 
              alt="UniTasker"
              sx={{ width: 32, height: 32 }}
            />
            <Typography variant="h6" color="primary">
              UniTasker
            </Typography>
          </Box>
          <IconButton onClick={() => setDrawerOpen(true)}>
            <MenuIcon />
          </IconButton>
        </Paper>

        {/* Bottom Navigation */}
        <Paper 
          sx={{ 
            position: 'fixed', 
            bottom: 0, 
            left: 0, 
            right: 0,
            zIndex: theme.zIndex.appBar,
            borderTop: `1px solid ${theme.palette.divider}`
          }} 
          elevation={3}
        >
          <BottomNavigation
            value={currentTab}
            onChange={handleNavigation}
            sx={{ height: 64 }}
            showLabels
          >
            {navItems.slice(0, 5).map((item) => (
              <BottomNavigationAction 
                key={item.value}
                label={item.label} 
                icon={item.icon}
                sx={{ 
                  minWidth: 'auto',
                  padding: '6px 4px',
                  '& .MuiBottomNavigationAction-label': {
                    fontSize: '10px'
                  },
                  '&.Mui-selected': {
                    color: theme.palette.primary.main,
                    '& .MuiBottomNavigationAction-label': {
                      fontSize: '10px',
                      fontWeight: 'bold'
                    }
                  }
                }}
              />
            ))}
            <BottomNavigationAction 
              label="More" 
              icon={<MenuIcon />}
              onClick={() => setDrawerOpen(true)}
              sx={{ 
                minWidth: 'auto',
                padding: '6px 4px',
                '& .MuiBottomNavigationAction-label': {
                  fontSize: '10px'
                }
              }}
            />
          </BottomNavigation>
        </Paper>
        
        {/* More options drawer for mobile */}
        <Drawer
          anchor="bottom"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        >
          <Box sx={{ p: 2 }}>
            <List>
              {navItems.slice(5).map((item) => (
                <ListItem 
                  button 
                  key={item.value}
                  onClick={() => {
                    setCurrentTab(item.value);
                    setDrawerOpen(false);
                  }}
                  sx={{
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(13, 110, 253, 0.08)',
                    }
                  }}
                  selected={currentTab === item.value}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>
      </>
    );
  }

  // Tablet & Desktop: Sidebar
  // For tablet, we default to collapsed state
  // For desktop, we use the user's toggle preference
  const isCollapsed = isTablet ? true : sidebarCollapsed;
  
  // Width based on collapsed state
  const sidebarWidth = isCollapsed ? 72 : (isDesktop ? 240 : 200);

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: sidebarWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: sidebarWidth,
          boxSizing: 'border-box',
          top: 0,
          height: '100vh',
          borderRight: `1px solid ${theme.palette.divider}`,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Header with logo */}
      <Toolbar sx={{ 
        justifyContent: isCollapsed ? 'center' : 'flex-start',
        minHeight: 64,
        px: 1
      }}>
        {!isCollapsed ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar 
              src="/favicon.png" 
              alt="UniTasker"
              sx={{ width: 36, height: 36 }}
            />
            <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
              UniTasker
            </Typography>
          </Box>
        ) : (
          <Avatar 
            src="/favicon.png" 
            alt="UniTasker"
            sx={{ width: 36, height: 36 }}
          />
        )}
      </Toolbar>
      
      <Divider />

      {/* Navigation Items - Scrollable area */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        <List>
          {navItems.map((item) => (
            <ListItem 
              button 
              key={item.value}
              selected={currentTab === item.value}
              onClick={() => setCurrentTab(item.value)}
              sx={{
                minHeight: 48,
                justifyContent: isCollapsed ? 'center' : 'initial',
                px: 2.5,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(13, 110, 253, 0.12)',
                  borderRight: `3px solid ${theme.palette.primary.main}`,
                  '&:hover': {
                    backgroundColor: 'rgba(13, 110, 253, 0.18)',
                  },
                  '& .MuiListItemIcon-root': {
                    color: theme.palette.primary.main,
                  },
                  '& .MuiListItemText-primary': {
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                  }
                },
                '&:hover': {
                  backgroundColor: 'rgba(13, 110, 253, 0.04)',
                }
              }}
            >
              <ListItemIcon sx={{ 
                minWidth: 0,
                justifyContent: 'center',
                mr: isCollapsed ? 0 : 2,
                color: currentTab === item.value ? theme.palette.primary.main : 'inherit'
              }}>
                {item.icon}
              </ListItemIcon>
              {!isCollapsed && (
                <ListItemText 
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: currentTab === item.value ? 600 : 400,
                  }}
                />
              )}
            </ListItem>
          ))}
        </List>
      </Box>

      <Divider />

      {/* Bottom section with collapse button - only show on desktop */}
      <Box sx={{ p: 1 }}>
        {isDesktop && (
          <ListItem 
            button 
            onClick={toggleSidebar}
            sx={{
              minHeight: 48,
              justifyContent: isCollapsed ? 'center' : 'initial',
              px: 2.5,
              borderRadius: 1,
              '&:hover': {
                backgroundColor: 'rgba(13, 110, 253, 0.04)',
              }
            }}
          >
            <ListItemIcon sx={{ 
              minWidth: 0,
              justifyContent: 'center',
              mr: isCollapsed ? 0 : 2
            }}>
              {sidebarCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </ListItemIcon>
            {!isCollapsed && (
              <ListItemText primary="Collapse" />
            )}
          </ListItem>
        )}
      </Box>
    </Drawer>
  );
};

export default Navigation;