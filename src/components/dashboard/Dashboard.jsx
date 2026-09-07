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
  Skeleton,
  Alert,
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
import { useDashboardData } from '../../hooks/useDashboardData';
import { createTimerSession, completeTimerSession, interruptTimerSession } from '../../services/timer.service';

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const {
    stats,
    todayTasks,
    upcomingTasks,
    recentNotes,
    upcomingEvents,
    loading,
    error,
    refetch,
  } = useDashboardData();

  const [timerRunning, setTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [timerSessionId, setTimerSessionId] = useState(null);

  // Timer logic with database logging
  useEffect(() => {
    let interval;
    if (timerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerRunning) {
      // Timer completed - log the session
      logTimerSession();
      setTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const startTimer = async () => {
    try {
      // Create a new timer session in IndexedDB
      const session = await createTimerSession(25 * 60);
      setTimerSessionId(session.id);
      setTimerRunning(true);
    } catch (err) {
      console.error('Failed to start timer session:', err);
    }
  };

  const logTimerSession = async () => {
    try {
      if (!timerSessionId) return;
      await completeTimerSession(timerSessionId);
    } catch (err) {
      console.error('Failed to complete timer session:', err);
    }
  };

  const pauseTimer = async () => {
    try {
      if (timerSessionId) {
        await interruptTimerSession(timerSessionId);
      }
      setTimerRunning(false);
    } catch (err) {
      console.error('Failed to pause timer:', err);
    }
  };

  const resetTimer = () => {
    setTimerRunning(false);
    setTimeLeft(25 * 60);
    setTimerSessionId(null);
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

  const formatEventDate = (dateString) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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

  const handleNavigateToCalendar = () => {
    window.dispatchEvent(new CustomEvent('navigationChange', { detail: 3 }));
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
          {loading ? (
            <Skeleton variant="text" width={40} height={40} />
          ) : (
            <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              {value}
            </Typography>
          )}
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

  const renderTaskList = (tasks, emptyMessage, maxItems = 8) => {
    if (loading) {
      return (
        <Box sx={{ py: 1 }}>
          <Skeleton variant="text" height={30} />
          <Skeleton variant="text" height={30} />
          <Skeleton variant="text" height={30} />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ mt: 1 }}>
          Failed to load data
        </Alert>
      );
    }

    if (tasks.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2, fontSize: '0.8rem' }}>
          {emptyMessage}
        </Typography>
      );
    }

    return (
      <List dense sx={{ 
        py: 0, 
        flex: 1,
        overflow: 'auto',
        '&::-webkit-scrollbar': { width: '4px' },
        '&::-webkit-scrollbar-thumb': { background: theme.palette.divider, borderRadius: '2px' },
      }}>
        {tasks.slice(0, maxItems).map((task, index) => (
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
                    {task.priority && (
                      <Chip
                        label={task.priority}
                        size="small"
                        color={getPriorityColor(task.priority)}
                        sx={{ height: 16, '& .MuiChip-label': { fontSize: '0.5rem', px: 0.5 } }}
                      />
                    )}
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
    );
  };

  const renderNoteList = (notes, emptyMessage, maxItems = 5) => {
    if (loading) {
      return (
        <Box sx={{ py: 1 }}>
          <Skeleton variant="text" height={30} />
          <Skeleton variant="text" height={30} />
          <Skeleton variant="text" height={30} />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ mt: 1 }}>
          Failed to load data
        </Alert>
      );
    }

    if (notes.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2, fontSize: '0.8rem' }}>
          {emptyMessage}
        </Typography>
      );
    }

    return (
      <List dense sx={{ 
        py: 0, 
        flex: 1,
        overflow: 'auto',
        '&::-webkit-scrollbar': { width: '4px' },
        '&::-webkit-scrollbar-thumb': { background: theme.palette.divider, borderRadius: '2px' },
      }}>
        {notes.slice(0, maxItems).map((note, index) => (
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
    );
  };

  const renderEventList = (events, emptyMessage, maxItems = 3) => {
    if (loading) {
      return (
        <Box sx={{ py: 1 }}>
          <Skeleton variant="text" height={30} />
          <Skeleton variant="text" height={30} />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ mt: 1 }}>
          Failed to load data
        </Alert>
      );
    }

    if (events.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2, fontSize: '0.8rem' }}>
          {emptyMessage}
        </Typography>
      );
    }

    return (
      <List dense sx={{ 
        py: 0, 
        flex: 1,
        overflow: 'auto',
        '&::-webkit-scrollbar': { width: '4px' },
        '&::-webkit-scrollbar-thumb': { background: theme.palette.divider, borderRadius: '2px' },
      }}>
        {events.slice(0, maxItems).map((event, index) => (
          <React.Fragment key={event.id}>
            {index > 0 && <Divider />}
            <ListItem sx={{ px: 0, py: 0.5 }}>
              <ListItemText
                primary={
                  <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                    {event.title}
                  </Typography>
                }
                secondary={
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
                    {formatEventDate(event.date)}
                  </Typography>
                }
              />
            </ListItem>
          </React.Fragment>
        ))}
      </List>
    );
  };

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
          onClick={handleNavigateToCalendar}
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
          onClick={timerRunning ? pauseTimer : startTimer}
          sx={{ flex: 1, py: 1 }}
          size="small"
        >
          {timerRunning ? formatTime(timeLeft) : 'Start 25:00'}
        </Button>
      </Box>

      {/* Row 3: Main Content - 2 Columns */}
      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: 2,
        flex: 1,
        minHeight: 0,
      }}>
        {/* Left Column */}
        <Box sx={{ 
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          minHeight: 0,
        }}>
          {/* Today's Tasks */}
          <Paper sx={{ 
            flex: 1,
            p: 1.5,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            minHeight: 0,
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
              {renderTaskList(todayTasks, 'Nothing due today. Enjoy the calm.')}
            </Box>
            {todayTasks.length > 0 && (
              <Button size="small" onClick={handleNavigateToTasks} sx={{ fontSize: '0.7rem', flexShrink: 0, mt: 1 }}>
                View all →
              </Button>
            )}
          </Paper>

          {/* Upcoming Deadlines */}
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
              {renderTaskList(upcomingTasks, 'No upcoming deadlines.')}
            </Box>
            {upcomingTasks.length > 0 && (
              <Button size="small" onClick={handleNavigateToTasks} sx={{ fontSize: '0.7rem', flexShrink: 0, mt: 1 }}>
                View all →
              </Button>
            )}
          </Paper>
        </Box>

        {/* Right Column */}
        <Box sx={{ 
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          minHeight: 0,
        }}>
          {/* Recent Notes */}
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
              {renderNoteList(recentNotes, 'No notes yet.')}
            </Box>
            {recentNotes.length > 0 && (
              <Button size="small" onClick={handleNavigateToNotes} sx={{ fontSize: '0.7rem', flexShrink: 0, mt: 1 }}>
                View all →
              </Button>
            )}
          </Paper>

          {/* Next Events */}
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
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}>
              {renderEventList(upcomingEvents, 'Calendar is clear.')}
            </Box>
            {upcomingEvents.length > 0 && (
              <Button size="small" onClick={handleNavigateToCalendar} sx={{ fontSize: '0.7rem', flexShrink: 0, mt: 1 }}>
                View all →
              </Button>
            )}
          </Paper>

          {/* Focus Timer */}
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
                  onClick={timerRunning ? pauseTimer : startTimer}
                  sx={{ fontSize: '0.7rem' }}
                >
                  {timerRunning ? 'Pause' : 'Start focus'}
                </Button>
                <Button
                  variant="text"
                  size="small"
                  onClick={handleNavigateToTimer}
                  sx={{ fontSize: '0.7rem' }}
                >
                  Open full timer
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