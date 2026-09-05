import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Task as TaskIcon,
  Note as NoteIcon,
  Event as EventIcon,
  Folder as FolderIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  PlayArrow as PlayArrowIcon,
  Timer as TimerIcon,
} from '@mui/icons-material';
import { useTasks } from '../../hooks/useTasks';
import { useNotes } from '../../hooks/useNotes';

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const { tasks } = useTasks();
  const { notes } = useNotes();

  const [stats, setStats] = useState({
    openTasks: 0,
    dueToday: 0,
    notesCount: 0,
    eventsCount: 0,
  });

  const [todayTasks, setTodayTasks] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [recentNotes, setRecentNotes] = useState([]);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds

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

    // Get today's tasks
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

    setTodayTasks(todayTasksList);

    // Get upcoming tasks
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const upcomingTasksList = tasks.filter(t => {
      if (!t.dueDate || t.status === 'Completed') return false;
      const dueDate = new Date(t.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate.getTime() > today.getTime() && 
             dueDate.getTime() <= nextWeek.getTime();
    }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    setUpcomingTasks(upcomingTasksList);

    // Get recent notes
    const recentNotesList = [...notes]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    setRecentNotes(recentNotesList);

  }, [tasks, notes]);

  // Timer logic
  useEffect(() => {
    let interval;
    if (timerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    setTimerRunning(!timerRunning);
  };

  const resetTimer = () => {
    setTimerRunning(false);
    setTimeLeft(25 * 60);
  };

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

  const handleNavigateToTasks = () => {
    window.dispatchEvent(new CustomEvent('navigationChange', { detail: 1 }));
  };

  const handleNavigateToNotes = () => {
    window.dispatchEvent(new CustomEvent('navigationChange', { detail: 2 }));
  };

  const handleNavigateToResources = () => {
    window.dispatchEvent(new CustomEvent('navigationChange', { detail: 4 }));
  };

  const handleNavigateToTimer = () => {
    window.dispatchEvent(new CustomEvent('navigationChange', { detail: 5 }));
  };

  const StatCard = ({ icon, title, value, onClick, color }) => (
    <Card
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        height: '100%',
        '&:hover': onClick ? {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4],
        } : {},
        bgcolor: 'background.paper',
        flex: 1,
      }}
      onClick={onClick}
    >
      <CardContent sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        p: 2,
        '&:last-child': { pb: 2 }
      }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            {value}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
            {title}
          </Typography>
        </Box>
        <Box
          sx={{
            p: 1,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'action.hover',
            color: color || 'primary.main',
          }}
        >
          {icon}
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ 
      height: 'calc(100vh - 180px)', 
      display: 'flex', 
      flexDirection: 'column',
      gap: 2,
    }}>
      {/* Row 1: Stats Cards */}
      <Box sx={{ 
        display: 'flex', 
        gap: 2,
        flexShrink: 0,
      }}>
        <StatCard
          icon={<TaskIcon sx={{ fontSize: 24 }} />}
          title="Open tasks"
          value={stats.openTasks}
          onClick={handleNavigateToTasks}
          color="primary.main"
        />
        <StatCard
          icon={<WarningIcon sx={{ fontSize: 24 }} />}
          title="Due today"
          value={stats.dueToday}
          onClick={handleNavigateToTasks}
          color="warning.main"
        />
        <StatCard
          icon={<NoteIcon sx={{ fontSize: 24 }} />}
          title="Notes"
          value={stats.notesCount}
          onClick={handleNavigateToNotes}
          color="info.main"
        />
        <StatCard
          icon={<EventIcon sx={{ fontSize: 24 }} />}
          title="Events"
          value={stats.eventsCount}
          color="success.main"
        />
      </Box>

      {/* Row 2: Quick Action Buttons */}
      <Box sx={{ 
        display: 'flex', 
        gap: 2,
        flexShrink: 0,
      }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleNavigateToTasks}
          sx={{ flex: 1, py: 1 }}
          size="small"
        >
          New task
        </Button>
        <Button
          variant="outlined"
          startIcon={<NoteIcon />}
          onClick={handleNavigateToNotes}
          sx={{ flex: 1, py: 1 }}
          size="small"
        >
          Notes
        </Button>
        <Button
          variant="outlined"
          startIcon={<FolderIcon />}
          onClick={handleNavigateToResources}
          sx={{ flex: 1, py: 1 }}
          size="small"
        >
          Resources
        </Button>
        <Button
          variant="outlined"
          startIcon={<TimerIcon />}
          onClick={toggleTimer}
          sx={{ flex: 1, py: 1 }}
          size="small"
        >
          {timerRunning ? formatTime(timeLeft) : '25:00'}
        </Button>
      </Box>

      {/* Row 3: Main Content - Flexbox with equal columns */}
      <Box sx={{ 
        display: 'flex', 
        gap: 2,
        flex: 1,
        minHeight: 0,
      }}>
        {/* Column 1: Today's Tasks */}
        <Paper sx={{ 
          flex: 1,
          p: 1.5,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.9rem', flexShrink: 0 }}>
            Today's Tasks
          </Typography>
          <Box sx={{ 
            flex: 1,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}>
            {todayTasks.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2, fontSize: '0.8rem' }}>
                Nothing due today. 🌟
              </Typography>
            ) : (
              <List dense sx={{ 
                py: 0, 
                flex: 1,
                overflow: 'auto',
                '&::-webkit-scrollbar': { width: '4px' },
                '&::-webkit-scrollbar-thumb': { background: theme.palette.divider, borderRadius: '2px' },
              }}>
                {todayTasks.slice(0, 8).map((task, index) => (
                  <React.Fragment key={task.id}>
                    {index > 0 && <Divider />}
                    <ListItem sx={{ px: 0, py: 0.5 }}>
                      <ListItemText
                        primary={
                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: '0.8rem',
                              textDecoration: task.status === 'Completed' ? 'line-through' : 'none',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            {task.title}
                            <Chip
                              label={task.priority}
                              size="small"
                              color={getPriorityColor(task.priority)}
                              sx={{ height: 16, '& .MuiChip-label': { fontSize: '0.5rem', px: 0.5 } }}
                            />
                          </Typography>
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
            {todayTasks.length > 8 && (
              <Button size="small" onClick={handleNavigateToTasks} sx={{ fontSize: '0.7rem', flexShrink: 0 }}>
                View all →
              </Button>
            )}
          </Box>
        </Paper>

        {/* Column 2: Upcoming Deadlines + Next Events */}
        <Box sx={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          minHeight: 0,
        }}>
          <Paper sx={{ 
            flex: 1,
            p: 1.5,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            minHeight: 0,
          }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.9rem', flexShrink: 0 }}>
              Upcoming Deadlines
            </Typography>
            <Box sx={{ 
              flex: 1,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}>
              {upcomingTasks.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 1, fontSize: '0.8rem' }}>
                  No upcoming deadlines. 🎉
                </Typography>
              ) : (
                <List dense sx={{ 
                  py: 0, 
                  flex: 1,
                  overflow: 'auto',
                  '&::-webkit-scrollbar': { width: '4px' },
                  '&::-webkit-scrollbar-thumb': { background: theme.palette.divider, borderRadius: '2px' },
                }}>
                  {upcomingTasks.slice(0, 5).map((task, index) => (
                    <React.Fragment key={task.id}>
                      {index > 0 && <Divider />}
                      <ListItem sx={{ px: 0, py: 0.5 }}>
                        <ListItemText
                          primary={
                            <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                              {task.title}
                            </Typography>
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
            </Box>
          </Paper>

          <Paper sx={{ 
            flex: 1,
            p: 1.5,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            minHeight: 0,
          }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.9rem', flexShrink: 0 }}>
              Next Events
            </Typography>
            <Box sx={{ 
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                Calendar is clear. 🗓️
              </Typography>
            </Box>
          </Paper>
        </Box>

        {/* Column 3: Recent Notes + Focus Timer */}
        <Box sx={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          minHeight: 0,
        }}>
          <Paper sx={{ 
            flex: 1,
            p: 1.5,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            minHeight: 0,
          }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.9rem', flexShrink: 0 }}>
              Recent Notes
            </Typography>
            <Box sx={{ 
              flex: 1,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}>
              {recentNotes.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 1, fontSize: '0.8rem' }}>
                  No notes yet. 📝
                </Typography>
              ) : (
                <List dense sx={{ 
                  py: 0, 
                  flex: 1,
                  overflow: 'auto',
                  '&::-webkit-scrollbar': { width: '4px' },
                  '&::-webkit-scrollbar-thumb': { background: theme.palette.divider, borderRadius: '2px' },
                }}>
                  {recentNotes.slice(0, 5).map((note, index) => (
                    <React.Fragment key={note.id}>
                      {index > 0 && <Divider />}
                      <ListItem sx={{ px: 0, py: 0.5 }}>
                        <ListItemText
                          primary={
                            <Typography variant="body2" sx={{ fontSize: '0.8rem' }} noWrap>
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
            </Box>
          </Paper>

          <Paper sx={{ 
            flex: 1,
            p: 1.5,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            minHeight: 0,
          }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.9rem', flexShrink: 0 }}>
              Focus Timer
            </Typography>
            <Box sx={{ 
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Typography variant="h3" sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '2.5rem' }}>
                {formatTime(timeLeft)}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={timerRunning ? <ScheduleIcon /> : <PlayArrowIcon />}
                  onClick={toggleTimer}
                  sx={{ fontSize: '0.7rem' }}
                >
                  {timerRunning ? 'Pause' : 'Start'}
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={resetTimer}
                  sx={{ fontSize: '0.7rem' }}
                >
                  Reset
                </Button>
                <Button
                  variant="text"
                  size="small"
                  onClick={handleNavigateToTimer}
                  sx={{ fontSize: '0.7rem' }}
                >
                  Full
                </Button>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;