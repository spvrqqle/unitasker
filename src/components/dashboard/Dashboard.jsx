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
  Event as EventIcon,
} from '@mui/icons-material';
import { useTasks } from '../../hooks/useTasks';
import { useNotes } from '../../hooks/useNotes';

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
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
      eventsCount: 0,
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

    setTodayTasks(todayTasksList.slice(0, 4));

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

    setUpcomingTasks(upcomingTasksList.slice(0, 4));

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
      <CardContent sx={{ p: 2.5 }}>
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
              minWidth: 40,
              minHeight: 40,
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
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
            icon={<TaskIcon sx={{ fontSize: 28 }} />}
            title="Open tasks"
            value={stats.openTasks}
            color="primary"
            onClick={handleNavigateToTasks}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            icon={<WarningIcon sx={{ fontSize: 28 }} />}
            title="Due today"
            value={stats.dueToday}
            color="warning"
            onClick={handleNavigateToTasks}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            icon={<NoteIcon sx={{ fontSize: 28 }} />}
            title="Notes"
            value={stats.notesCount}
            color="info"
            onClick={handleNavigateToNotes}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            icon={<EventIcon sx={{ fontSize: 28 }} />}
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
          <Paper sx={{ p: 2.5, mb: 3 }}>
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
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        {task.status === 'Completed' ? (
                          <CheckCircleIcon color="success" />
                        ) : (
                          <ScheduleIcon color={new Date(task.dueDate) < new Date() ? 'error' : 'warning'} />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
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
                              sx={{ height: 20, '& .MuiChip-label': { fontSize: '0.65rem', px: 1 } }}
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

          <Paper sx={{ p: 2.5 }}>
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
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <ScheduleIcon color="info" />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Typography variant="body2">
                              {task.title}
                            </Typography>
                            <Chip
                              label={task.priority}
                              size="small"
                              color={getPriorityColor(task.priority)}
                              sx={{ height: 20, '& .MuiChip-label': { fontSize: '0.65rem', px: 1 } }}
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

        {/* Right Column - Notes and Timer/Events */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2.5, mb: 3 }}>
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
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
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
                            {note.content ? note.content.substring(0, 60) : 'Empty note'}
                            {note.content && note.content.length > 60 ? '...' : ''}
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

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Paper sx={{ p: 2.5, height: '100%' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Next Events
                </Typography>
                <Typography color="text.secondary" sx={{ py: 1 }}>
                  Calendar is clear. 🗓️
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper sx={{ p: 2.5, height: '100%' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Focus Timer
                </Typography>
                <Typography variant="h3" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                  25:00
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<PlayArrowIcon />}
                  onClick={handleNavigateToTimer}
                  sx={{ mt: 1 }}
                  fullWidth
                >
                  Start focus
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;