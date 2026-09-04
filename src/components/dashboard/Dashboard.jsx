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

    setTodayTasks(todayTasksList.slice(0, 3));

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

    setUpcomingTasks(upcomingTasksList.slice(0, 3));

    // Get recent notes
    const recentNotesList = [...notes]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 2);
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
        height: '100%',
        '&:hover': onClick ? {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4],
        } : {},
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              bgcolor: `${color}.light`,
              color: `${color}.main`,
              p: 0.75,
              borderRadius: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
              {value}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
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
    <Box sx={{ height: '100%' }}>
      {/* Stats Grid - 4 columns */}
      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        <Grid item xs={6} sm={3}>
          <StatCard
            icon={<TaskIcon sx={{ fontSize: 18 }} />}
            title="Open tasks"
            value={stats.openTasks}
            color="primary"
            onClick={handleNavigateToTasks}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            icon={<WarningIcon sx={{ fontSize: 18 }} />}
            title="Due today"
            value={stats.dueToday}
            color="warning"
            onClick={handleNavigateToTasks}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            icon={<NoteIcon sx={{ fontSize: 18 }} />}
            title="Notes"
            value={stats.notesCount}
            color="info"
            onClick={handleNavigateToNotes}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            icon={<CalendarIcon sx={{ fontSize: 18 }} />}
            title="Events"
            value={stats.eventsCount}
            color="success"
          />
        </Grid>
      </Grid>

      {/* Quick Action Button */}
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleNavigateToTasks}
        fullWidth={isMobile}
        size="small"
        sx={{ mb: 2, py: 1 }}
      >
        New task
      </Button>

      {/* Main Content Grid - 2 columns */}
      <Grid container spacing={2}>
        {/* Left Column - Tasks */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 1.5, mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, fontSize: '0.95rem' }}>
              Today's Tasks
            </Typography>
            {todayTasks.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                Nothing due today. Enjoy the calm! 🌟
              </Typography>
            ) : (
              <List dense sx={{ py: 0 }}>
                {todayTasks.map((task, index) => (
                  <React.Fragment key={task.id}>
                    {index > 0 && <Divider />}
                    <ListItem sx={{ px: 0, py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 30 }}>
                        {task.status === 'Completed' ? (
                          <CheckCircleIcon color="success" sx={{ fontSize: 16 }} />
                        ) : (
                          <ScheduleIcon color={new Date(task.dueDate) < new Date() ? 'error' : 'warning'} sx={{ fontSize: 16 }} />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                            <Typography
                              variant="body2"
                              sx={{
                                textDecoration: task.status === 'Completed' ? 'line-through' : 'none',
                                fontSize: '0.8rem',
                              }}
                            >
                              {task.title}
                            </Typography>
                            <Chip
                              label={task.priority}
                              size="small"
                              color={getPriorityColor(task.priority)}
                              sx={{ height: 16, '& .MuiChip-label': { fontSize: '0.5rem', px: 0.5 } }}
                            />
                          </Box>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
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
              <Button size="small" onClick={handleNavigateToTasks} sx={{ mt: 0.5, fontSize: '0.7rem' }}>
                View all →
              </Button>
            )}
          </Paper>

          <Paper sx={{ p: 1.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, fontSize: '0.95rem' }}>
              Upcoming Deadlines
            </Typography>
            {upcomingTasks.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                No upcoming deadlines. 🎉
              </Typography>
            ) : (
              <List dense sx={{ py: 0 }}>
                {upcomingTasks.map((task, index) => (
                  <React.Fragment key={task.id}>
                    {index > 0 && <Divider />}
                    <ListItem sx={{ px: 0, py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 30 }}>
                        <ScheduleIcon color="info" sx={{ fontSize: 16 }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                            <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                              {task.title}
                            </Typography>
                            <Chip
                              label={task.priority}
                              size="small"
                              color={getPriorityColor(task.priority)}
                              sx={{ height: 16, '& .MuiChip-label': { fontSize: '0.5rem', px: 0.5 } }}
                            />
                          </Box>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
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
              <Button size="small" onClick={handleNavigateToTasks} sx={{ mt: 0.5, fontSize: '0.7rem' }}>
                View all →
              </Button>
            )}
          </Paper>
        </Grid>

        {/* Right Column - Notes and Events/Timer */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 1.5, mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, fontSize: '0.95rem' }}>
              Recent Notes
            </Typography>
            {recentNotes.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                No notes yet. Start writing! 📝
              </Typography>
            ) : (
              <List dense sx={{ py: 0 }}>
                {recentNotes.map((note, index) => (
                  <React.Fragment key={note.id}>
                    {index > 0 && <Divider />}
                    <ListItem sx={{ px: 0, py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 30 }}>
                        <NoteIcon sx={{ fontSize: 16 }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="body2" noWrap sx={{ fontSize: '0.8rem' }}>
                            {note.title || 'Untitled note'}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
                            {note.content ? note.content.substring(0, 40) : 'Empty note'}
                            {note.content && note.content.length > 40 ? '...' : ''}
                          </Typography>
                        }
                      />
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            )}
            {recentNotes.length > 0 && (
              <Button size="small" onClick={handleNavigateToNotes} sx={{ mt: 0.5, fontSize: '0.7rem' }}>
                View all →
              </Button>
            )}
          </Paper>

          <Grid container spacing={1.5}>
            <Grid item xs={6}>
              <Paper sx={{ p: 1.5, height: '100%' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.85rem' }}>
                  Next Events
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                  Calendar is clear. 🗓️
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper sx={{ p: 1.5, height: '100%' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.85rem' }}>
                  Focus Timer
                </Typography>
                <Typography variant="h5" sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1.3rem' }}>
                  25:00
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<PlayArrowIcon sx={{ fontSize: 14 }} />}
                  onClick={handleNavigateToTimer}
                  sx={{ mt: 0.5, fontSize: '0.65rem', py: 0.5 }}
                  fullWidth
                >
                  Start
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