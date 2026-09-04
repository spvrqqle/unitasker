import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  Stack,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Task as TaskIcon,
  Note as NoteIcon,
  CalendarToday as CalendarIcon,
  Timer as TimerIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  PlayArrow as PlayArrowIcon,
} from '@mui/icons-material';
import { useTasks } from '../../hooks/useTasks';
import { useNotes } from '../../hooks/useNotes';

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  const { tasks, loading: tasksLoading } = useTasks();
  const { notes, loading: notesLoading } = useNotes();

  const [stats, setStats] = useState({
    openTasks: 0,
    dueToday: 0,
    notesCount: 0,
    eventsCount: 0,
  });

  const [todayTasks, setTodayTasks] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [recentNotes, setRecentNotes] = useState([]);

  useEffect(() => {
    // Calculate stats
    const openTasks = tasks.filter(t => t.status !== 'Completed').length;
    const dueToday = tasks.filter(t => {
      if (!t.dueDate || t.status === 'Completed') return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDate = new Date(t.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate.getTime() === today.getTime();
    }).length;
    const notesCount = notes.length;

    setStats({
      openTasks,
      dueToday,
      notesCount,
      eventsCount: 0, // Will be updated when calendar is added
    });

    // Get today's tasks (due today or overdue)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayTasksList = tasks.filter(t => {
      if (!t.dueDate || t.status === 'Completed') return false;
      const dueDate = new Date(t.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate.getTime() <= today.getTime() || 
             (dueDate.getTime() >= today.getTime() && dueDate.getTime() < tomorrow.getTime());
    }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    setTodayTasks(todayTasksList.slice(0, 5));

    // Get upcoming tasks (next 7 days)
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const upcomingTasksList = tasks.filter(t => {
      if (!t.dueDate || t.status === 'Completed') return false;
      const dueDate = new Date(t.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate.getTime() > today.getTime() && 
             dueDate.getTime() <= nextWeek.getTime();
    }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    setUpcomingTasks(upcomingTasksList.slice(0, 5));

    // Get recent notes
    const recentNotesList = [...notes]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 3);
    setRecentNotes(recentNotesList);

  }, [tasks, notes]);

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(date);
    dueDate.setHours(0, 0, 0, 0);
    
    if (dueDate.getTime() === today.getTime()) return 'Today';
    if (dueDate.getTime() < today.getTime()) return 'Overdue';
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'error';
      case 'Medium': return 'warning';
      case 'Low': return 'success';
      default: return 'default';
    }
  };

  const StatCard = ({ icon, title, value, color, onClick }) => (
    <Card
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s',
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[4],
        } : {},
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              bgcolor: `${color}.light`,
              color: `${color}.main`,
              p: 1,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const handleNavigateToTasks = () => {
    window.dispatchEvent(new CustomEvent('navigationChange', { detail: 1 }));
  };

  const handleNavigateToNotes = () => {
    window.dispatchEvent(new CustomEvent('navigationChange', { detail: 2 }));
  };

  const handleNavigateToTimer = () => {
    window.dispatchEvent(new CustomEvent('navigationChange', { detail: 5 }));
  };

  return (
    <Box>
      {/* Stats Grid */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <StatCard
            icon={<TaskIcon />}
            title="Open tasks"
            value={stats.openTasks}
            color="primary"
            onClick={handleNavigateToTasks}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            icon={<WarningIcon />}
            title="Due today"
            value={stats.dueToday}
            color="warning"
            onClick={handleNavigateToTasks}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            icon={<NoteIcon />}
            title="Notes"
            value={stats.notesCount}
            color="info"
            onClick={handleNavigateToNotes}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            icon={<CalendarIcon />}
            title="Events"
            value={stats.eventsCount}
            color="success"
          />
        </Grid>
      </Grid>

      {/* Quick Action Button */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleNavigateToTasks}
          fullWidth={isMobile}
          sx={{ py: 1.5 }}
        >
          New task
        </Button>
      </Box>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Left Column - Tasks */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Today's Tasks
            </Typography>
            {todayTasks.length === 0 ? (
              <Typography color="text.secondary" sx={{ py: 2 }}>
                Nothing due today. Enjoy the calm! 🌟
              </Typography>
            ) : (
              <List dense>
                {todayTasks.map((task, index) => (
                  <React.Fragment key={task.id}>
                    {index > 0 && <Divider />}
                    <ListItem>
                      <ListItemIcon>
                        {task.status === 'Completed' ? (
                          <CheckCircleIcon color="success" />
                        ) : (
                          <ScheduleIcon color={new Date(task.dueDate) < new Date() ? 'error' : 'warning'} />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography
                              variant="body2"
                              sx={{
                                textDecoration: task.status === 'Completed' ? 'line-through' : 'none',
                              }}
                            >
                              {task.title}
                            </Typography>
                            <Chip
                              label={task.priority}
                              size="small"
                              color={getPriorityColor(task.priority)}
                              sx={{ height: 20, '& .MuiChip-label': { fontSize: '0.6rem', px: 1 } }}
                            />
                          </Box>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(task.dueDate)}
                          </Typography>
                        }
                      />
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            )}
            {todayTasks.length > 0 && (
              <Button size="small" onClick={handleNavigateToTasks} sx={{ mt: 1 }}>
                View all tasks →
              </Button>
            )}
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Upcoming Deadlines
            </Typography>
            {upcomingTasks.length === 0 ? (
              <Typography color="text.secondary" sx={{ py: 2 }}>
                No upcoming deadlines. 🎉
              </Typography>
            ) : (
              <List dense>
                {upcomingTasks.map((task, index) => (
                  <React.Fragment key={task.id}>
                    {index > 0 && <Divider />}
                    <ListItem>
                      <ListItemIcon>
                        <ScheduleIcon color="info" />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2">
                              {task.title}
                            </Typography>
                            <Chip
                              label={task.priority}
                              size="small"
                              color={getPriorityColor(task.priority)}
                              sx={{ height: 20, '& .MuiChip-label': { fontSize: '0.6rem', px: 1 } }}
                            />
                          </Box>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(task.dueDate)}
                          </Typography>
                        }
                      />
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            )}
            {upcomingTasks.length > 0 && (
              <Button size="small" onClick={handleNavigateToTasks} sx={{ mt: 1 }}>
                View all tasks →
              </Button>
            )}
          </Paper>
        </Grid>

        {/* Right Column - Notes and Timer */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Recent Notes
            </Typography>
            {recentNotes.length === 0 ? (
              <Typography color="text.secondary" sx={{ py: 2 }}>
                No notes yet. Start writing! 📝
              </Typography>
            ) : (
              <List dense>
                {recentNotes.map((note, index) => (
                  <React.Fragment key={note.id}>
                    {index > 0 && <Divider />}
                    <ListItem>
                      <ListItemIcon>
                        <NoteIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="body2" noWrap>
                            {note.title || 'Untitled note'}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {note.content ? note.content.substring(0, 50) : 'Empty note'}
                            {note.content && note.content.length > 50 ? '...' : ''}
                          </Typography>
                        }
                      />
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            )}
            {recentNotes.length > 0 && (
              <Button size="small" onClick={handleNavigateToNotes} sx={{ mt: 1 }}>
                View all notes →
              </Button>
            )}
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Next Events
            </Typography>
            <Typography color="text.secondary" sx={{ py: 2 }}>
              Calendar is clear. 🗓️
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Focus Timer Widget */}
      <Paper sx={{ p: 3, mt: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Focus Timer
          </Typography>
          <Typography variant="h3" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
            25:00
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            startIcon={<PlayArrowIcon />}
            onClick={handleNavigateToTimer}
          >
            Start focus
          </Button>
          <Button
            variant="outlined"
            onClick={handleNavigateToTimer}
          >
            Open full timer
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default Dashboard;